using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WishTrip.Data;
using Volo.Abp.DependencyInjection;

namespace WishTrip.EntityFrameworkCore;

public class EntityFrameworkCoreWishTripDbSchemaMigrator
    : IWishTripDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCoreWishTripDbSchemaMigrator(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolving the WishTripDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<WishTripDbContext>()
            .Database
            .MigrateAsync();
    }
}
