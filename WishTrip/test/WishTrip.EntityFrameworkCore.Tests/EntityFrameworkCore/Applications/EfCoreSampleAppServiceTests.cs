using WishTrip.Samples;
using Xunit;

namespace WishTrip.EntityFrameworkCore.Applications;

[Collection(WishTripTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<WishTripEntityFrameworkCoreTestModule>
{

}
