namespace WishTrip.Destinos
{
    public class CityDto
    {
        public string Nombre { get; set; }
        public string Pais { get; set; }
        public string CountryCode { get; set; }
        public string Region { get; set; }
        public int? Poblacion { get; set; }
        public double? Lat { get; set; }
        public double? Lon { get; set; } 
        public string WikiDataId { get; set; }
    }
}