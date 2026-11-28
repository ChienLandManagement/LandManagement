using Serilog.Core;
using Serilog.Events;

namespace LandManagement.Common;

// Log của ResultLib đã có LogId (mã lỗi trả cho client); mọi log còn lại được gán một LogId mới để cột id trong error_logs không bao giờ trống.
public class LogIdEnricher : ILogEventEnricher
{
    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory) =>
        logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("LogId", Guid.CreateVersion7().ToString("N")));
}
