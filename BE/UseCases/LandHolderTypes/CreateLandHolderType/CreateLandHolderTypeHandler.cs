using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.LandHolderTypes.CreateLandHolderType;

public class CreateLandHolderTypeHandler(AppDbContext db) : IRequestHandler<CreateLandHolderTypeCommand, ErrorOr<LandHolderTypeItem>>
{
    public async Task<ErrorOr<LandHolderTypeItem>> Handle(CreateLandHolderTypeCommand cmd, CancellationToken ct)
    {
        var code = cmd.Code.Trim();
        if (await db.LandHolderTypes.AnyAsync(x => x.Code.ToLower() == code.ToLower(), ct))
            return Error.Conflict("Mã đối tượng sử dụng/quản lý đất đã tồn tại".ToMessageForUser());

        LandHolderType? parent = null;
        if (cmd.ParentId is { } parentId)
        {
            parent = await db.LandHolderTypes.FirstOrDefaultAsync(x => x.Id == parentId, ct);
            if (parent is null) return Error.NotFound("Không tìm thấy đối tượng sử dụng/quản lý đất cha".ToMessageForUser());
        }

        if (parent is not null && parent.Kind != cmd.Kind)
            return Error.Validation("Đối tượng con phải cùng nhóm với đối tượng cha".ToMessageForUser());

        var nextOrder = (await db.LandHolderTypes.MaxAsync(x => (int?)x.SortOrder, ct) ?? 0) + 1;
        var entity = new LandHolderType
        {
            Code = code,
            Name = cmd.Name.Trim(),
            ParentId = cmd.ParentId,
            SortOrder = nextOrder,
            Kind = cmd.Kind,
        };
        db.LandHolderTypes.Add(entity);
        await db.SaveChangesAsync(ct);
        return LandHolderTypeItem.From(entity);
    }
}
