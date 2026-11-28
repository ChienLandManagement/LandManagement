using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.LandTypes.CreateLandType;

public class CreateLandTypeHandler(AppDbContext db) : IRequestHandler<CreateLandTypeCommand, ErrorOr<LandTypeItem>>
{
    public async Task<ErrorOr<LandTypeItem>> Handle(CreateLandTypeCommand cmd, CancellationToken ct)
    {
        var code = cmd.Code.Trim();
        if (await db.LandTypes.AnyAsync(x => x.Code.ToLower() == code.ToLower(), ct))
            return Error.Conflict("Mã loại đất đã tồn tại".ToMessageForUser());

        LandType? parent = null;
        if (cmd.ParentId is { } parentId)
        {
            parent = await db.LandTypes.FirstOrDefaultAsync(x => x.Id == parentId, ct);
            if (parent is null) return Error.NotFound("Không tìm thấy loại đất cha".ToMessageForUser());
        }

        var nextOrder = (await db.LandTypes.MaxAsync(x => (int?)x.SortOrder, ct) ?? 0) + 1;
        var entity = new LandType
        {
            Code = code,
            Name = cmd.Name.Trim(),
            ParentId = cmd.ParentId,
            SortOrder = nextOrder,
            InB02 = cmd.InB02,
            InB05 = cmd.InB05,
        };
        db.LandTypes.Add(entity);
        await db.SaveChangesAsync(ct);
        return LandTypeItem.From(entity);
    }
}
