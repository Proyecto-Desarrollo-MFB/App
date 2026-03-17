using AutoMapper;
using Volo.Abp.AutoMapper;
using WishTrip.Destinos;
using WishTrip.TravelExperiences;

namespace WishTrip;

public class WishTripApplicationAutoMapperProfile : Profile
{
    public WishTripApplicationAutoMapperProfile()
    {
        CreateMap<Destino, DestinoDto>();
        CreateMap<CreateUpdateDestinoDto, Destino>();
        CreateMap<Calificacion, CalificacionDto>();
        CreateMap<CreateUpdateCalificacionDto, Calificacion>();
        CreateMap<TravelExperience, TravelExperienceDto>();
        CreateMap<CreateUpdateTravelExperienceDto, TravelExperience>().IgnoreFullAuditedObjectProperties();
        /* You can configure your AutoMapper mapping configuration here.
         * Alternatively, you can split your mapping configurations
         * into multiple profile classes for a better organization. */
    }
}
