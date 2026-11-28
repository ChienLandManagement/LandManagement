using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.LandTypes.UpdateLandType;

public class UpdateLandTypeHandler(AppDbContext db) : IRequestHandler<UpdateLandTypeCommand, ErrorOr<LandTypeItem>>
{
    public async Task<ErrorOr<LandTypeItem>> Handle(UpdateLandTypeCommand cmd, CancellationToken ct)
    {
        var entity = await db.LandTypes.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (entity is null)
            return Error.NotFound("Không tìm thấy loại đất".ToMessageForUser());

        var code = cmd.Code.Trim();
        if (await db.LandTypes.AnyAsync(x => x.Id != cmd.Id && x.Code.ToLower() == code.ToLower(), ct))
            return Error.Conflict("Mã loại đất đã tồn tại".ToMessageForUser());

        LandType? parent = null;
        if (cmd.ParentId is { } parentId)
        {
            parent = await db.LandTypes.FirstOrDefaultAsync(x => x.Id == parentId, ct);
            if (parent is null) return Error.NotFound("Không tìm thấy loại đất cha".ToMessageForUser());

            // Không cho đặt cha là chính nó hoặc con cháu của nó (sẽ tạo vòng lặp trong cây).
            var parentOf = await db.LandTypes.Select(x => new { x.Id, x.ParentId }).ToDictionaryAsync(x => x.Id, x => x.ParentId, ct);
            for (Guid? cursor = parentId; cursor is { } id; cursor = parentOf.GetValueOrDefault(id))
                if (id == cmd.Id) return Error.Validation("Không thể chọn chính nó hoặc mục con làm mục cha".ToMessageForUser());
        }

        entity.Code = code;
        entity.Name = cmd.Name.Trim();
        entity.ParentId = cmd.ParentId;
        entity.SortOrder = cmd.SortOrder;
        entity.InB02 = cmd.InB02;
        entity.InB05 = cmd.InB05;
        await db.SaveChangesAsync(ct);
        return LandTypeItem.From(entity);
    }
}
