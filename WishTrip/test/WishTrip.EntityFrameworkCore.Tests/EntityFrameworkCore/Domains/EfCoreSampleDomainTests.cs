using WishTrip.Samples;
using Xunit;

namespace WishTrip.EntityFrameworkCore.Domains;

[Collection(WishTripTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<WishTripEntityFrameworkCoreTestModule>
{

}
