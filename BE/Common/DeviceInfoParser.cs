using LandManagement.Entities;
using MyCSharp.HttpUserAgentParser;
using ResultLib.Extensions;

namespace LandManagement.Common;

public readonly record struct DeviceInfo(string? Browser, string? Os, DeviceType DeviceType);

public static class DeviceInfoParser
{
    public static DeviceInfo Parse(string? userAgent)
    {
        if (userAgent.IsEmpty()) return new DeviceInfo(null, null, DeviceType.Unknown);

        var info = HttpUserAgentInformation.Parse(userAgent);
        var browser = info.Name.IsEmpty() ? null : info.Version.IsEmpty() ? info.Name : $"{info.Name} {info.Version}";

        return new DeviceInfo(browser, info.Platform?.Name, GetDeviceType(info, userAgent));
    }

    // iPad báo là "Mobile"; Android không có token "Mobile" là máy tính bảng.
    private static DeviceType GetDeviceType(HttpUserAgentInformation info, string userAgent)
    {
        if (info.IsRobot()) return DeviceType.Bot;
        if (userAgent.Contains("iPad", StringComparison.OrdinalIgnoreCase) || userAgent.Contains("Tablet", StringComparison.OrdinalIgnoreCase)) return DeviceType.Tablet;
        if (info.IsMobile()) return DeviceType.Phone;
        return info.IsBrowser() ? DeviceType.Desktop : DeviceType.Unknown;
    }
}
