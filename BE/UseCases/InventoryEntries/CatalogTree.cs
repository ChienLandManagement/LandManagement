using LandManagement.Data;
using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.UseCases.InventoryEntries;

// Cây loại đất và danh sách đối tượng, dùng để biết ô nào nhập được (ô lá) và tính tổng dòng cha.
public class CatalogTree
{
    private readonly ILookup<Guid, LandType> _children;
    private readonly HashSet<Guid> _holderParents;

    private CatalogTree(List<LandType> landTypes, List<LandHolderType> holders)
    {
        LandTypes = landTypes;
        Holders = holders;
        LandTypeById = landTypes.ToDictionary(x => x.Id);
        LandTypeByCode = landTypes.ToDictionary(x => x.Code, StringComparer.OrdinalIgnoreCase);
        HolderById = holders.ToDictionary(x => x.Id);
        _children = landTypes.Where(x => x.ParentId != null).ToLookup(x => x.ParentId!.Value);
        _holderParents = holders.Where(x => x.ParentId != null).Select(x => x.ParentId!.Value).ToHashSet();
    }

    public List<LandType> LandTypes { get; }
    public List<LandHolderType> Holders { get; }
    public Dictionary<Guid, LandType> LandTypeById { get; }
    public Dictionary<string, LandType> LandTypeByCode { get; }
    public Dictionary<Guid, LandHolderType> HolderById { get; }

    public static async Task<CatalogTree> LoadAsync(AppDbContext db, CancellationToken ct) =>
        new(await db.LandTypes.AsNoTracking().OrderBy(x => x.SortOrder).ToListAsync(ct),
            await db.LandHolderTypes.AsNoTracking().OrderBy(x => x.SortOrder).ToListAsync(ct));

    public bool IsHolderLeaf(Guid holderId) => !_holderParents.Contains(holderId);

    // Biểu 01: nhập ở loại đất không còn con (con "trong đó" không tính vào cha nên không chặn).
    public bool IsAreaLeaf(LandType t) => _children[t.Id].All(c => c.IsMemo);

    // Biểu 02: chỉ các loại đất có dòng ở biểu này. Dòng trung gian không ở biểu 02 (vd CHN) thì bỏ qua, nên xét cả cháu chắt.
    public bool IsCountLeaf(LandType t) => t.InB02 && !Descendants(t).Any(d => d.InB02 && !d.IsMemo);

    /// <summary>Các loại đất lá (không phải "trong đó") nằm dưới loại đất này, gồm cả chính nó khi là lá.</summary>
    public IEnumerable<LandType> AreaLeavesUnder(LandType t) => LeavesUnder(t, IsAreaLeaf);

    public IEnumerable<LandType> CountLeavesUnder(LandType t) => LeavesUnder(t, IsCountLeaf);

    private IEnumerable<LandType> LeavesUnder(LandType t, Func<LandType, bool> isLeaf) =>
        isLeaf(t) ? [t] : Descendants(t).Where(d => !d.IsMemo && isLeaf(d));

    // Con cháu không đi qua nhánh "trong đó".
    private IEnumerable<LandType> Descendants(LandType t)
    {
        foreach (var child in _children[t.Id].Where(c => !c.IsMemo))
        {
            yield return child;
            foreach (var d in Descendants(child)) yield return d;
        }
    }
}
