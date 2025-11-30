using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace WishTrip.EntityFrameworkCore;

/* This class is needed for EF Core console commands
 * (like Add-Migration and Update-Database commands) */
public class WishTripDbContextFactory : IDesignTimeDbContextFactory<WishTripDbContext>
{
    public WishTripDbContext CreateDbContext(string[] args)
    {
        var configuration = BuildConfiguration();
        
        WishTripEfCoreEntityExtensionMappings.Configure();

        var builder = new DbContextOptionsBuilder<WishTripDbContext>()
            .UseSqlServer(configuration.GetConnectionString("Default"));
        
        return new WishTripDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../WishTrip.DbMigrator/"))
            .AddJsonFile("appsettings.json", optional: false);

        return builder.Build();
    }
}
