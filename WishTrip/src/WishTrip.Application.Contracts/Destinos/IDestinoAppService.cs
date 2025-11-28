using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
}
