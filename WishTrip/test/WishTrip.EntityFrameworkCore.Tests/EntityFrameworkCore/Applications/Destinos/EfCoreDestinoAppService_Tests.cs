using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WishTrip.Destinos;
using Xunit;

namespace WishTrip.EntityFrameworkCore.Applications.Destinos;

[Collection(WishTripTestConsts.CollectionDefinitionName)]
public class EfCoreDestinoAppService_Tests : DestinoAppService_Tests<WishTripEntityFrameworkCoreTestModule>
{

}
