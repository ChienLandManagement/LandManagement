using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.LandHolderTypes.UpdateLandHolderType;

public class UpdateLandHolderTypeHandler(AppDbContext db) : IRequestHandler<UpdateLandHolderTypeCommand, ErrorOr<LandHolderTypeItem>>
{
    public async Task<ErrorOr<LandHolderTypeItem>> Handle(UpdateLandHolderTypeCommand cmd, CancellationToken ct)
    {
        var entity = await db.LandHolderTypes.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (entity is null)
            return Error.NotFound("Không tìm thấy đối tượng sử dụng/quản lý đất".ToMessageForUser());

        var code = cmd.Code.Trim();
        if (await db.LandHolderTypes.AnyAsync(x => x.Id != cmd.Id && x.Code.ToLower() == code.ToLower(), ct))
            return Error.Conflict("Mã đối tượng sử dụng/quản lý đất đã tồn tại".ToMessageForUser());

        LandHolderType? parent = null;
        if (cmd.ParentId is { } parentId)
        {
            parent = await db.LandHolderTypes.FirstOrDefaultAsync(x => x.Id == parentId, ct);
            if (parent is null) return Error.NotFound("Không tìm thấy đối tượng sử dụng/quản lý đất cha".ToMessageForUser());

            // Không cho đặt cha là chính nó hoặc con cháu của nó (sẽ tạo vòng lặp trong cây).
            var parentOf = await db.LandHolderTypes.Select(x => new { x.Id, x.ParentId }).ToDictionaryAsync(x => x.Id, x => x.ParentId, ct);
            for (Guid? cursor = parentId; cursor is { } id; cursor = parentOf.GetValueOrDefault(id))
                if (id == cmd.Id) return Error.Validation("Không thể chọn chính nó hoặc mục con làm mục cha".ToMessageForUser());
        }

        if (parent is not null && parent.Kind != cmd.Kind)
            return Error.Validation("Đối tượng con phải cùng nhóm với đối tượng cha".ToMessageForUser());

        if (entity.Kind != cmd.Kind && await db.LandHolderTypes.AnyAsync(x => x.ParentId == cmd.Id && x.Kind != cmd.Kind, ct))
            return Error.Validation("Không thể đổi nhóm khi còn đối tượng con thuộc nhóm khác".ToMessageForUser());

        entity.Code = code;
        entity.Name = cmd.Name.Trim();
        entity.ParentId = cmd.ParentId;
        entity.SortOrder = cmd.SortOrder;
        entity.Kind = cmd.Kind;
        await db.SaveChangesAsync(ct);
        return LandHolderTypeItem.From(entity);
    }
}
