using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace WishTrip.Destinos;

public class DestinoAppService :
    CrudAppService<
        Destino,
        DestinoDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateDestinoDto>,
    IDestinoAppService
{
    private readonly ICitySearchService _citySearchService;
    public DestinoAppService(IRepository<Destino, Guid> repository, ICitySearchService citySearchService)
        : base(repository)
    {
        _citySearchService = citySearchService;
    }

    public async Task<CitySearchResultDto> SearchCitiesAsync(CitySearchRequestDto request)
    {
        return await _citySearchService.SearchCitiesAsync(request);
    }
}
