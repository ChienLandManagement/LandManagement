using ErrorOr;
using MediatR;

namespace LandManagement.Api.Common.Interfaces;

public interface ICommand<T> : IRequest<ErrorOr<T>>;

public interface ICommand : IRequest<ErrorOr<Unit>>;

public interface IQuery<T> : IRequest<ErrorOr<T>>;