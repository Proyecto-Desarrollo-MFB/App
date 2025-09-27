using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace WishTrip.Destinos
{
    public class CreateUpdateDestinoDto
    {
        [Required]
        [StringLength(128)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public string Pais{ get; set; } = string.Empty;

        [Required]
        public int Poblacion { get; set; }

        [Required]
        public string Foto { get; set; } = string.Empty;

    }
}
