using System.Net;
using System.Text.Json;

namespace LandManagement.Api.Middleware;

public class GlobalExceptionHandler(RequestDelegate next, ILogger<GlobalExceptionHandler> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception occurred");
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            var result = ResultLib.Core.Result.InternalError("An error occurred. Please try again later.");
            await context.Response.WriteAsync(JsonSerializer.Serialize(result));
        }
    }
}
