using LandManagement.Api.Common.Exceptions;
using ErrorOr;
using MediatR;

namespace LandManagement.Api.Common.Behaviors;

public class DomainExceptionBehavior<TRequest, TResponse>(
) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
    where TResponse : IErrorOr
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        try
        {
            return await next();
        }
        catch (DomainException ex)
        {
            var errors = new[] { Error.Conflict(ex.Message) };
            return (dynamic)errors;
        }
    }
}
