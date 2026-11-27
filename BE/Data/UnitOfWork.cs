using LandManagement.Api.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.Api.Data;

public class UnitOfWork(IServiceProvider serviceProvider, AppDbContext context) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => context.SaveChangesAsync(cancellationToken);

    public Task BeginTransactionAsync(CancellationToken cancellationToken = default)
        => context.BeginTransactionAsync(cancellationToken);

    public Task CommitTransactionAsync(CancellationToken cancellationToken = default)
        => context.CommitTransactionAsync(cancellationToken);

    public Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
        => context.RollbackTransactionAsync(cancellationToken);

    public async Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken = default)
    {
        var strategy = context.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await BeginTransactionAsync(cancellationToken);
            try
            {
                await action(cancellationToken);
                await CommitTransactionAsync(cancellationToken);
            }
            catch
            {
                try { await RollbackTransactionAsync(cancellationToken); }
                catch
                {
                    // ignored
                }

                throw;
            }
        });
    }
}
