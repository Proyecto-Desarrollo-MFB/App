using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace WishTrip.Destinos
{
    public interface ICitySearchService : IApplicationService
    {
        Task<CitySearchResultDto> SearchCitiesAsync(CitySearchRequestDto request);
    }
}
