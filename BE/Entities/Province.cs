using ResultLib.Models;

namespace LandManagement.Entities;

// Tỉnh/thành phố. Việt Nam đã bỏ cấp huyện nên địa giới chỉ còn 2 cấp: Tỉnh -> Xã/Phường (mô hình giống VBDT).
public class Province : AuditableEntity<Guid>
{
    public Province() => Id = Guid.CreateVersion7();

    public string ProvinceCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? PlaceType { get; set; }
    public string? Country { get; set; }

    public ICollection<Ward> Wards { get; set; } = [];
}
