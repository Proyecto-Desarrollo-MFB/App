using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WishTrip.Destinos
{
    public class CreateUpdateCalificacionDto
    {
        [Required]
        public Guid DestinoId { get; set; }

        [Range(1, 5)]
        public int Puntaje { get; set; }

        public string Comentario { get; set; }
    }
}
