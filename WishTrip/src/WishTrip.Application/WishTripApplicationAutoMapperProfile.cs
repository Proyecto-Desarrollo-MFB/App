using WishTrip.Destinos;
using AutoMapper;

namespace WishTrip;

public class WishTripApplicationAutoMapperProfile : Profile
{
    public WishTripApplicationAutoMapperProfile()
    {
        CreateMap<Destino, DestinoDto>();
        CreateMap<CreateUpdateDestinoDto, Destino>();
        CreateMap<Calificacion, CalificacionDto>();
        CreateMap<CreateUpdateCalificacionDto, Calificacion>();
        /* You can configure your AutoMapper mapping configuration here.
         * Alternatively, you can split your mapping configurations
         * into multiple profile classes for a better organization. */
    }
}
