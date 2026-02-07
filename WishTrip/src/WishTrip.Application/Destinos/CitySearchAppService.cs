using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using WishTrip.Destinos;

namespace WishTrip.Destinos
{
    public class CitySearchAppService : ApplicationService, ICitySearchService
    {
        private readonly GeoDbCitySearchService _geoDbService;

        public CitySearchAppService(GeoDbCitySearchService geoDbService)
        {
            _geoDbService = geoDbService;
        }

        public async Task<CitySearchResultDto> SearchCitiesAsync(CitySearchRequestDto input)
        {
            return await _geoDbService.SearchCitiesAsync(input);
        }
    }
}