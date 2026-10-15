export const METODOS = [
  { id: "v60", nome: "V60", proporcao: "1:15", dose: "20 g de café", agua: "300 ml", moagem: "Média-fina", temperatura: "93 °C",
    etapas: [{ nome: "Bloom: molhe o pó e espere", segundos: 45 }, { nome: "Primeiro despejo até 180 ml", segundos: 45 },
      { nome: "Segundo despejo até 300 ml", segundos: 45 }, { nome: "Deixe escorrer", segundos: 45 }] },
  { id: "prensa", nome: "Prensa francesa", proporcao: "1:16", dose: "30 g de café", agua: "480 ml", moagem: "Grossa", temperatura: "95 °C",
    etapas: [{ nome: "Despeje toda a água", segundos: 30 }, { nome: "Infusão com a tampa", segundos: 210 }, { nome: "Pressione devagar e sirva", segundos: 30 }] },
  { id: "espresso", nome: "Espresso", proporcao: "1:2", dose: "18 g de café", agua: "36 g na xícara", moagem: "Fina", temperatura: "93 °C",
    etapas: [{ nome: "Pré-infusão", segundos: 5 }, { nome: "Extração", segundos: 25 }] },
];
