using Xunit;

namespace WishTrip.EntityFrameworkCore;

[CollectionDefinition(WishTripTestConsts.CollectionDefinitionName)]
public class WishTripEntityFrameworkCoreCollection : ICollectionFixture<WishTripEntityFrameworkCoreFixture>
{

}
