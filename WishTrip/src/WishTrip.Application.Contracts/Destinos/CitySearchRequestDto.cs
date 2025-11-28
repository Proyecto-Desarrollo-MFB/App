using Volo.Abp.Application.Dtos;

namespace WishTrip.Destinos
{
    public class CitySearchRequestDto: PagedAndSortedResultRequestDto
    {
        public string PartialName { get; set; }
        public string? Destination { get; set; }
        public string? Country { get; set; }
    }
}