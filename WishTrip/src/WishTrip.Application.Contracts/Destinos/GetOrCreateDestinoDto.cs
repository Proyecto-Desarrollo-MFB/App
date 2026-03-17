// GetOrCreateDestinoDto.cs
namespace WishTrip.Destinos
{
    public class GetOrCreateDestinoDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Pais { get; set; } = string.Empty;
        public int Poblacion { get; set; }
    }
}