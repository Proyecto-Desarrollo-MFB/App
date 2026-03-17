using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace WishTrip.Destinos;

public interface IDestinoAppService :
    ICrudAppService<
        DestinoDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateDestinoDto>
{
    Task<CitySearchResultDto> SearchCitiesAsync(CitySearchRequestDto request);
    Task<DestinoDto> GetOrCreateByNameAsync(GetOrCreateDestinoDto input);
}