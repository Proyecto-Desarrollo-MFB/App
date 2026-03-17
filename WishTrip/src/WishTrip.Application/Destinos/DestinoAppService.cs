using AutoMapper.Internal.Mappers;
using System;
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

    public async Task<DestinoDto> GetOrCreateByNameAsync(GetOrCreateDestinoDto input)
    {
        var existing = await Repository.FindAsync(
            x => x.Nombre == input.Nombre && x.Pais == input.Pais);

        if (existing != null)
            return ObjectMapper.Map<Destino, DestinoDto>(existing);

        var nuevo = new Destino
        {
            Nombre = input.Nombre,
            Pais = input.Pais,
            Poblacion = input.Poblacion,
            Foto = string.Empty,
            ActualizacionDesdeAPI = DateTime.Now
        };

        await Repository.InsertAsync(nuevo, autoSave: true);
        return ObjectMapper.Map<Destino, DestinoDto>(nuevo);
    }
}