// src/data/peru-locations.ts

export interface District {
    name: string;
  }
  
  export interface Province {
    name: string;
    districts: District[];
  }
  
  export interface Department {
    name: string;
    provinces: Province[];
  }
  
  export const peruLocations: Department[] = [
    {
      name: 'Amazonas',
      provinces: [
        {
          name: 'Bagua',
          districts: [
            { name: 'Aramango' },
            { name: 'Bagua' },
            { name: 'Copallin' },
            { name: 'El Parco' },
            { name: 'Imaza' },
            { name: 'La Peca' },
          ],
        },
        {
          name: 'Bongará',
          districts: [
            { name: 'Chisquilla' },
            { name: 'Churuja' },
            { name: 'Corosha' },
            { name: 'Cuispes' },
            { name: 'Florida' },
            { name: 'Jazan' },
            { name: 'Jumbilla' },
            { name: 'Recta' },
            { name: 'San Carlos' },
            { name: 'Shipasbamba' },
            { name: 'Valera' },
            { name: 'Yambrasbamba' },
          ],
        },
        {
          name: 'Chachapoyas',
          districts: [
            { name: 'Asunción' },
            { name: 'Balsas' },
            { name: 'Chachapoyas' },
            { name: 'Cheto' },
            { name: 'Chiliquin' },
            { name: 'Chuquibamba' },
            { name: 'Granada' },
            { name: 'Huancas' },
            { name: 'La Jalca' },
            { name: 'Leimebamba' },
            { name: 'Levanto' },
            { name: 'Magdalena' },
            { name: 'Mariscal Castilla' },
            { name: 'Molinopampa' },
            { name: 'Montevideo' },
            { name: 'Olleros' },
            { name: 'Quinjalca' },
            { name: 'San Francisco de Daguas' },
            { name: 'San Isidro de Maino' },
            { name: 'Soloco' },
            { name: 'Sonche' },
          ],
        },
        {
          name: 'Condorcanqui',
          districts: [{ name: 'El Cenepa' }, { name: 'Nieva' }, { name: 'Río Santiago' }],
        },
        {
          name: 'Luya',
          districts: [
            { name: 'Camporredondo' },
            { name: 'Cocabamba' },
            { name: 'Colcamar' },
            { name: 'Conila' },
            { name: 'Inguilpata' },
            { name: 'Lamud' },
            { name: 'Longuita' },
            { name: 'Lonya Chico' },
            { name: 'Luya' },
            { name: 'Luya Viejo' },
            { name: 'María' },
            { name: 'Ocalli' },
            { name: 'Ocumal' },
            { name: 'Pisuquia' },
            { name: 'Providencia' },
            { name: 'San Cristóbal' },
            { name: 'San Francisco del Yeso' },
            { name: 'San Jerónimo' },
            { name: 'San Juan de Lopecancha' },
            { name: 'Santa Catalina' },
            { name: 'Santo Tomas' },
            { name: 'Tingo' },
            { name: 'Trita' },
          ],
        },
        {
          name: 'Rodríguez de Mendoza',
          districts: [
            { name: 'Chirimoto' },
            { name: 'Cochamal' },
            { name: 'Huambo' },
            { name: 'Limabamba' },
            { name: 'Longar' },
            { name: 'Mariscal Benavides' },
            { name: 'Milpuc' },
            { name: 'Omia' },
            { name: 'San Nicolás' },
            { name: 'Santa Rosa' },
            { name: 'Totora' },
            { name: 'Vista Alegre' },
          ],
        },
        {
          name: 'Utcubamba',
          districts: [
            { name: 'Bagua Grande' },
            { name: 'Cajaruro' },
            { name: 'Cumba' },
            { name: 'El Milagro' },
            { name: 'Jamalca' },
            { name: 'Lonya Grande' },
            { name: 'Yamon' },
          ],
        },
      ],
    },
    {
      name: 'Áncash',
      provinces: [
        {
          name: 'Aija',
          districts: [{ name: 'Aija' }, { name: 'Coris' }, { name: 'Huacllan' }, { name: 'La Merced' }, { name: 'Succha' }],
        },
        {
          name: 'Antonio Raymondi',
          districts: [
            { name: 'Aczo' },
            { name: 'Chaccho' },
            { name: 'Chingas' },
            { name: 'Llamellin' },
            { name: 'Mirgas' },
            { name: 'San Juan de Rontoy' },
          ],
        },
        {
          name: 'Asunción',
          districts: [{ name: 'Chacas' }, { name: 'Acochaca' }],
        },
        {
          name: 'Bolognesi',
          districts: [
            { name: 'Abelardo Pardo Lezameta' },
            { name: 'Antonio Raymondi' },
            { name: 'Aquia' },
            { name: 'Cajacay' },
            { name: 'Canis' },
            { name: 'Chiquian' },
            { name: 'Colquioc' },
            { name: 'Huallanca' },
            { name: 'Huasta' },
            { name: 'Huayllacayan' },
            { name: 'La Primavera' },
            { name: 'Mangas' },
            { name: 'Pacllon' },
            { name: 'San Miguel de Corpanqui' },
            { name: 'Ticllos' },
          ],
        },
        {
          name: 'Carhuaz',
          districts: [
            { name: 'Acopampa' },
            { name: 'Amashca' },
            { name: 'Anta' },
            { name: 'Ataquero' },
            { name: 'Carhuaz' },
            { name: 'Marcara' },
            { name: 'Pariahuanca' },
            { name: 'San Miguel de Aco' },
            { name: 'Shilla' },
            { name: 'Tinco' },
            { name: 'Yungar' },
          ],
        },
        {
          name: 'Carlos Fermín Fitzcarrald',
          districts: [{ name: 'San Luis' }, { name: 'San Nicolás' }, { name: 'Yauya' }],
        },
        {
          name: 'Casma',
          districts: [{ name: 'Buena Vista Alta' }, { name: 'Casma' }, { name: 'Comandante Noel' }, { name: 'Yautan' }],
        },
        {
          name: 'Corongo',
          districts: [
            { name: 'Aco' },
            { name: 'Bambas' },
            { name: 'Corongo' },
            { name: 'Cusca' },
            { name: 'La Pampa' },
            { name: 'Yanac' },
            { name: 'Yupan' },
          ],
        },
        {
          name: 'Huaraz',
          districts: [
            { name: 'Cochabamba' },
            { name: 'Colcabamba' },
            { name: 'Huanchay' },
            { name: 'Huaraz' },
            { name: 'Independencia' },
            { name: 'Jangas' },
            { name: 'La Libertad' },
            { name: 'Olleros' },
            { name: 'Pampas Grande' },
            { name: 'Pariacoto' },
            { name: 'Pira' },
            { name: 'Tarica' },
          ],
        },
        {
          name: 'Huari',
          districts: [
            { name: 'Anra' },
            { name: 'Cajay' },
            { name: 'Chavin de Huantar' },
            { name: 'Huacachi' },
            { name: 'Huacchis' },
            { name: 'Huachis' },
            { name: 'Huantar' },
            { name: 'Huari' },
            { name: 'Masin' },
            { name: 'Paucas' },
            { name: 'Ponto' },
            { name: 'Rahuapampa' },
            { name: 'Rapayan' },
            { name: 'San Marcos' },
            { name: 'San Pedro de Chana' },
            { name: 'Uco' },
          ],
        },
        {
          name: 'Huarmey',
          districts: [{ name: 'Cochapeti' }, { name: 'Culebras' }, { name: 'Huarmey' }, { name: 'Huayan' }, { name: 'Malvas' }],
        },
        {
          name: 'Huaylas',
          districts: [
            { name: 'Caraz' },
            { name: 'Huallanca' },
            { name: 'Huata' },
            { name: 'Huaylas' },
            { name: 'Mato' },
            { name: 'Pamparomas' },
            { name: 'Pueblo Libre' },
            { name: 'Santa Cruz' },
            { name: 'Santo Toribio' },
            { name: 'Yuracmarca' },
          ],
        },
        {
          name: 'Mariscal Luzuriaga',
          districts: [
            { name: 'Casca' },
            { name: 'Eleazar Guzmán Barron' },
            { name: 'Fidel Olivas Escudero' },
            { name: 'Llama' },
            { name: 'Llumpa' },
            { name: 'Lucma' },
            { name: 'Musga' },
            { name: 'Piscobamba' },
          ],
        },
        {
          name: 'Ocros',
          districts: [
            { name: 'Acas' },
            { name: 'Cajamarquilla' },
            { name: 'Carhuapampa' },
            { name: 'Cochas' },
            { name: 'Congas' },
            { name: 'Llipa' },
            { name: 'Ocros' },
            { name: 'San Cristóbal de Rajan' },
            { name: 'San Pedro' },
            { name: 'Santiago de Chilcas' },
          ],
        },
        {
          name: 'Pallasca',
          districts: [
            { name: 'Bolognesi' },
            { name: 'Cabana' },
            { name: 'Conchucos' },
            { name: 'Huacaschuque' },
            { name: 'Huandoval' },
            { name: 'Lacabamba' },
            { name: 'Llapo' },
            { name: 'Pallasca' },
            { name: 'Pampas' },
            { name: 'Santa Rosa' },
            { name: 'Tauca' },
          ],
        },
        {
          name: 'Pomabamba',
          districts: [{ name: 'Huayllan' }, { name: 'Parobamba' }, { name: 'Pomabamba' }, { name: 'Quinuabamba' }],
        },
        {
          name: 'Recuay',
          districts: [
            { name: 'Catac' },
            { name: 'Cotaparaco' },
            { name: 'Huayllapampa' },
            { name: 'Llacllin' },
            { name: 'Marca' },
            { name: 'Pampas Chico' },
            { name: 'Pararin' },
            { name: 'Recuay' },
            { name: 'Tapacocha' },
            { name: 'Ticapampa' },
          ],
        },
        {
          name: 'Santa',
          districts: [
            { name: 'Caceres del Perú' },
            { name: 'Chimbote' },
            { name: 'Coishco' },
            { name: 'Macate' },
            { name: 'Moro' },
            { name: 'Nepeña' },
            { name: 'Nuevo Chimbote' },
            { name: 'Samanco' },
            { name: 'Santa' },
          ],
        },
        {
          name: 'Sihuas',
          districts: [
            { name: 'Acobamba' },
            { name: 'Alfonso Ugarte' },
            { name: 'Cashapampa' },
            { name: 'Chingalpo' },
            { name: 'Huayllabamba' },
            { name: 'Quiches' },
            { name: 'Ragash' },
            { name: 'San Juan' },
            { name: 'Sicsibamba' },
            { name: 'Sihuas' },
          ],
        },
        {
          name: 'Yungay',
          districts: [
            { name: 'Cascapara' },
            { name: 'Mancos' },
            { name: 'Matacoto' },
            { name: 'Quillo' },
            { name: 'Ranrahirca' },
            { name: 'Shupluy' },
            { name: 'Yanama' },
            { name: 'Yungay' },
          ],
        },
      ],
    },
    {
      name: 'Apurímac',
      provinces: [
        {
          name: 'Abancay',
          districts: [
            { name: 'Abancay' },
            { name: 'Chacoche' },
            { name: 'Circa' },
            { name: 'Curahuasi' },
            { name: 'Huanipaca' },
            { name: 'Lambrama' },
            { name: 'Pichirhua' },
            { name: 'San Pedro de Cachora' },
            { name: 'Tamburco' },
          ],
        },
        {
          name: 'Andahuaylas',
          districts: [
            { name: 'Andahuaylas' },
            { name: 'Andarapa' },
            { name: 'Chiara' },
            { name: 'Huancarama' },
            { name: 'Huancaray' },
            { name: 'Huayana' },
            { name: 'José María Arguedas' },
            { name: 'Kaquiabamba' },
            { name: 'Kishuara' },
            { name: 'Pacobamba' },
            { name: 'Pacucha' },
            { name: 'Pampachiri' },
            { name: 'Pomacocha' },
            { name: 'San Antonio de Cachi' },
            { name: 'San Jerónimo' },
            { name: 'San Miguel de Chaccrampa' },
            { name: 'Santa María de Chicmo' },
            { name: 'Talavera' },
            { name: 'Tumay Huaraca' },
            { name: 'Turpo' },
          ],
        },
        {
          name: 'Antabamba',
          districts: [
            { name: 'Antabamba' },
            { name: 'El Oro' },
            { name: 'Huaquirca' },
            { name: 'Juan Espinoza Medrano' },
            { name: 'Oropesa' },
            { name: 'Pachaconas' },
            { name: 'Sabaino' },
          ],
        },
        {
          name: 'Aymaraes',
          districts: [
            { name: 'Capaya' },
            { name: 'Caraybamba' },
            { name: 'Chalhuanca' },
            { name: 'Chapimarca' },
            { name: 'Colcabamba' },
            { name: 'Cotaruse' },
            { name: 'Huayllo' },
            { name: 'Justo Apu Sahuaraura' },
            { name: 'Lucre' },
            { name: 'Pocohuanca' },
            { name: 'San Juan de Chacña' },
            { name: 'Sañayca' },
            { name: 'Soraya' },
            { name: 'Tapairihua' },
            { name: 'Tintay' },
            { name: 'Toraya' },
            { name: 'Yanaca' },
          ],
        },
        {
          name: 'Chincheros',
          districts: [
            { name: 'Anco_Huallo' },
            { name: 'Chincheros' },
            { name: 'Cocharcas' },
            { name: 'Huaccana' },
            { name: 'Ocobamba' },
            { name: 'Ongoy' },
            { name: 'Ranracancha' },
            { name: 'Rocchacc' },
            { name: 'Uranmarca' },
          ],
        },
        {
          name: 'Cotabambas',
          districts: [
            { name: 'Challhuahuacho' },
            { name: 'Cotabambas' },
            { name: 'Coyllurqui' },
            { name: 'Haquira' },
            { name: 'Mara' },
            { name: 'Tambobamba' },
          ],
        },
        {
          name: 'Grau',
          districts: [
            { name: 'Chuquibambilla' },
            { name: 'Curpahuasi' },
            { name: 'Gamarra' },
            { name: 'Huayllati' },
            { name: 'Mamara' },
            { name: 'Micaela Bastidas' },
            { name: 'Pataypampa' },
            { name: 'Progreso' },
            { name: 'San Antonio' },
            { name: 'Santa Rosa' },
            { name: 'Turpay' },
            { name: 'Vilcabamba' },
            { name: 'Virundo' },
          ],
        },
      ],
    },
    {
      name: 'Arequipa',
      provinces: [
        {
          name: 'Arequipa',
          districts: [
            { name: 'Alto Selva Alegre' },
            { name: 'Arequipa' },
            { name: 'Cayma' },
            { name: 'Cerro Colorado' },
            { name: 'Characato' },
            { name: 'Chiguata' },
            { name: 'Jacobo Hunter' },
            { name: 'Jose Luis Bustamante y Rivero' },
            { name: 'La Joya' },
            { name: 'Mariano Melgar' },
            { name: 'Miraflores' },
            { name: 'Mollebaya' },
            { name: 'Paucarpata' },
            { name: 'Pocsi' },
            { name: 'Polobaya' },
            { name: 'Quequeña' },
            { name: 'Sabandia' },
            { name: 'Sachaca' },
            { name: 'San Juan de Siguas' },
            { name: 'San Juan de Tarucani' },
            { name: 'Santa Isabel de Siguas' },
            { name: 'Santa Rita de Siguas' },
            { name: 'Socabaya' },
            { name: 'Tiabaya' },
            { name: 'Uchumayo' },
            { name: 'Vitor' },
            { name: 'Yanahuara' },
            { name: 'Yarabamba' },
            { name: 'Yura' },
          ],
        },
        {
          name: 'Camaná',
          districts: [
            { name: 'Camaná' },
            { name: 'Jose María Quimper' },
            { name: 'Mariano Nicolas Valcarcel' },
            { name: 'Mariscal Caceres' },
            { name: 'Nicolas de Pierola' },
            { name: 'Ocoña' },
            { name: 'Quilca' },
            { name: 'Samuel Pastor' },
          ],
        },
        {
          name: 'Caravelí',
          districts: [
            { name: 'Acari' },
            { name: 'Atico' },
            { name: 'Atiquipa' },
            { name: 'Bella Union' },
            { name: 'Cahuacho' },
            { name: 'Caravelí' },
            { name: 'Chala' },
            { name: 'Chaparra' },
            { name: 'Huanuhuanu' },
            { name: 'Jaqui' },
            { name: 'Lomas' },
            { name: 'Quicacha' },
            { name: 'Yauca' },
          ],
        },
        {
          name: 'Castilla',
          districts: [
            { name: 'Andagua' },
            { name: 'Aplao' },
            { name: 'Ayo' },
            { name: 'Chachas' },
            { name: 'Chilcaymarca' },
            { name: 'Choco' },
            { name: 'Huancarqui' },
            { name: 'Machaguay' },
            { name: 'Orcopampa' },
            { name: 'Pampacolca' },
            { name: 'Tipan' },
            { name: 'Uñon' },
            { name: 'Uraca' },
            { name: 'Viraco' },
          ],
        },
        {
          name: 'Caylloma',
          districts: [
            { name: 'Achoma' },
            { name: 'Cabanaconde' },
            { name: 'Callalli' },
            { name: 'Caylloma' },
            { name: 'Chivay' },
            { name: 'Coporaque' },
            { name: 'Huambo' },
            { name: 'Huanca' },
            { name: 'Ichupampa' },
            { name: 'Lari' },
            { name: 'Lluta' },
            { name: 'Maca' },
            { name: 'Madrigal' },
            { name: 'Majes' },
            { name: 'San Antonio de Chuca' },
            { name: 'Sibayo' },
            { name: 'Tapay' },
            { name: 'Tisco' },
            { name: 'Tuti' },
            { name: 'Yanque' },
          ],
        },
        {
          name: 'Condesuyos',
          districts: [
            { name: 'Andaray' },
            { name: 'Cayarani' },
            { name: 'Chichas' },
            { name: 'Chuquibamba' },
            { name: 'Iray' },
            { name: 'Rio Grande' },
            { name: 'Salamanca' },
            { name: 'Yanaquihua' },
          ],
        },
        {
          name: 'Islay',
          districts: [{ name: 'Cocachacra' }, { name: 'Dean Valdivia' }, { name: 'Islay' }, { name: 'Mejia' }, { name: 'Mollendo' }, { name: 'Punta de Bombon' }],
        },
        {
          name: 'La Uniòn',
          districts: [
            { name: 'Alca' },
            { name: 'Charcana' },
            { name: 'Cotahuasi' },
            { name: 'Huaynacotas' },
            { name: 'Pampamarca' },
            { name: 'Puyca' },
            { name: 'Quechualla' },
            { name: 'Sayla' },
            { name: 'Tauria' },
            { name: 'Tomepampa' },
            { name: 'Toro' },
          ],
        },
      ],
    },
    {
      name: 'Ayacucho',
      provinces: [
        {
          name: 'Cangallo',
          districts: [
            { name: 'Cangallo' },
            { name: 'Chuschi' },
            { name: 'Los Morochucos' },
            { name: 'María Parado de Bellido' },
            { name: 'Paras' },
            { name: 'Totos' },
          ],
        },
        {
          name: 'Huamanga',
          districts: [
            { name: 'Acocro' },
            { name: 'Acos Vinchos' },
            { name: 'Andrés Avelino Cáceres Dorregaray' },
            { name: 'Ayacucho' },
            { name: 'Carmen Alto' },
            { name: 'Chiara' },
            { name: 'Jesús Nazareno' },
            { name: 'Ocros' },
            { name: 'Pacaycasa' },
            { name: 'Quinua' },
            { name: 'San José de Ticllas' },
            { name: 'San Juan Bautista' },
            { name: 'Santiago de Pischa' },
            { name: 'Socos' },
            { name: 'Tambillo' },
            { name: 'Vinchos' },
          ],
        },
        {
          name: 'Huanca Sancos',
          districts: [{ name: 'Carapo' }, { name: 'Sacsamarca' }, { name: 'Sancos' }, { name: 'Santiago de Lucanamarca' }],
        },
        {
          name: 'Huanta',
          districts: [
            { name: 'Ayahuanco' },
            { name: 'Huamanguilla' },
            { name: 'Huanta' },
            { name: 'Iguain' },
            { name: 'Llochegua' },
            { name: 'Luricocha' },
            { name: 'Santillana' },
            { name: 'Sivia' },
          ],
        },
        {
          name: 'La Mar',
          districts: [
            { name: 'Anco' },
            { name: 'Ayna' },
            { name: 'Chilcas' },
            { name: 'Chungui' },
            { name: 'Luis Carranza' },
            { name: 'San Miguel' },
            { name: 'Santa Rosa' },
            { name: 'Tambo' },
          ],
        },
        {
          name: 'Lucanas',
          districts: [
            { name: 'Aucara' },
            { name: 'Cabana' },
            { name: 'Carmen Salcedo' },
            { name: 'Chaviña' },
            { name: 'Chipao' },
            { name: 'Huac-Huas' },
            { name: 'Laramate' },
            { name: 'Leoncio Prado' },
            { name: 'Llauta' },
            { name: 'Lucanas' },
            { name: 'Ocaña' },
            { name: 'Otoca' },
            { name: 'Puquio' },
            { name: 'Saisa' },
            { name: 'San Cristóbal' },
            { name: 'San Juan' },
            { name: 'San Pedro' },
            { name: 'San Pedro de Palco' },
            { name: 'Sancos' },
            { name: 'Santa Ana de Huaycahuacho' },
            { name: 'Santa Lucia' },
          ],
        },
        {
          name: 'Parinacochas',
          districts: [
            { name: 'Chumpi' },
            { name: 'Coracora' },
            { name: 'Coronel Castañeda' },
            { name: 'Pacapausa' },
            { name: 'Pullo' },
            { name: 'Puyusca' },
            { name: 'San Francisco de Ravacayco' },
            { name: 'Upahuacho' },
          ],
        },
        {
          name: 'Pàucar del Sara Sara',
          districts: [
            { name: 'Colta' },
            { name: 'Corculla' },
            { name: 'Lampa' },
            { name: 'Marcabamba' },
            { name: 'Oyolo' },
            { name: 'Pararca' },
            { name: 'Pausa' },
            { name: 'San Javier de Alpabamba' },
            { name: 'San José de Ushua' },
            { name: 'Sara Sara' },
          ],
        },
        {
          name: 'Sucre',
          districts: [
            { name: 'Belén' },
            { name: 'Chalcos' },
            { name: 'Chilcayoc' },
            { name: 'Huacaña' },
            { name: 'Morcolla' },
            { name: 'Paico' },
            { name: 'Querobamba' },
            { name: 'San Pedro de Larcay' },
            { name: 'San Salvador de Quije' },
            { name: 'Santiago de Paucaray' },
            { name: 'Soras' },
          ],
        },
        {
          name: 'Víctor Fajardo',
          districts: [
            { name: 'Alcamenca' },
            { name: 'Apongo' },
            { name: 'Asquipata' },
            { name: 'Canaria' },
            { name: 'Cayara' },
            { name: 'Colca' },
            { name: 'Huamanquiquia' },
            { name: 'Huancapi' },
            { name: 'Huancaraylla' },
            { name: 'Huaya' },
            { name: 'Sarhua' },
            { name: 'Vilcanchos' },
          ],
        },
        {
          name: 'Vilcas Huamán',
          districts: [
            { name: 'Accomarca' },
            { name: 'Carhuanca' },
            { name: 'Concepción' },
            { name: 'Huambalpa' },
            { name: 'Independencia' },
            { name: 'Saurama' },
            { name: 'Vilcas Huaman' },
            { name: 'Vischongo' },
          ],
        },
      ],
    },
    {
      name: 'Cajamarca',
      provinces: [
        {
          name: 'Cajabamba',
          districts: [{ name: 'Cachachi' }, { name: 'Cajabamba' }, { name: 'Condebamba' }, { name: 'Sitacocha' }],
        },
        {
          name: 'Cajamarca',
          districts: [
            { name: 'Asunción' },
            { name: 'Cajamarca' },
            { name: 'Chetilla' },
            { name: 'Cospan' },
            { name: 'Encañada' },
            { name: 'Jesús' },
            { name: 'Llacanora' },
            { name: 'Los Baños del Inca' },
            { name: 'Magdalena' },
            { name: 'Matara' },
            { name: 'Namora' },
            { name: 'San Juan' },
          ],
        },
        {
          name: 'Celendín',
          districts: [
            { name: 'Celendín' },
            { name: 'Chumuch' },
            { name: 'Cortegana' },
            { name: 'Huasmin' },
            { name: 'Jorge Chávez' },
            { name: 'José Gálvez' },
            { name: 'Miguel Iglesias' },
            { name: 'Oxamarca' },
            { name: 'Sorochuco' },
            { name: 'Sucre' },
            { name: 'Utco' },
            { name: 'La Libertad de Pallan' },
          ],
        },
        {
          name: 'Chota',
          districts: [
            { name: 'Anguia' },
            { name: 'Chadin' },
            { name: 'Chiguirip' },
            { name: 'Chimban' },
            { name: 'Choropampa' },
            { name: 'Chota' },
            { name: 'Cochabamba' },
            { name: 'Conchan' },
            { name: 'Huambos' },
            { name: 'Lajas' },
            { name: 'Llama' },
            { name: 'Miracosta' },
            { name: 'Paccha' },
            { name: 'Pion' },
            { name: 'Querocoto' },
            { name: 'San Juan de Licupis' },
            { name: 'Tacabamba' },
            { name: 'Tocmoche' },
            { name: 'Querocotillo' },
          ],
        },
        {
          name: 'Contumazá',
          districts: [
            { name: 'Chilete' },
            { name: 'Contumaza' },
            { name: 'Cupisnique' },
            { name: 'Guzmango' },
            { name: 'San Benito' },
            { name: 'Santa Cruz de Toled' },
            { name: 'Tantarica' },
            { name: 'Yonan' },
          ],
        },
        {
          name: 'Cutervo',
          districts: [
            { name: 'Callayuc' },
            { name: 'Choros' },
            { name: 'Cujillo' },
            { name: 'Cutervo' },
            { name: 'La Ramada' },
            { name: 'Pimpingos' },
            { name: 'Querocotillo' },
            { name: 'San Andrés de Cutervo' },
            { name: 'San Erasto' },
            { name: 'San Juan de Cutervo' },
            { name: 'San Luis de Lucma' },
            { name: 'Santa Cruz' },
            { name: 'Santo Domingo de la Capilla' },
            { name: 'Santo Tomas' },
            { name: 'Socota' },
          ],
        },
        {
          name: 'Hualgayoc',
          districts: [{ name: 'Bambamarca' }, { name: 'Chugur' }, { name: 'Hualgayoc' }],
        },
        {
          name: 'Jaén',
          districts: [
            { name: 'Bellavista' },
            { name: 'Chontali' },
            { name: 'Colasay' },
            { name: 'Huabal' },
            { name: 'Jaén' },
            { name: 'Las Pirias' },
            { name: 'Pomahuaca' },
            { name: 'Pucara' },
            { name: 'Sallique' },
            { name: 'San Felipe' },
            { name: 'San José del Alto' },
            { name: 'Santa Rosa' },
          ],
        },
        {
          name: 'San Ignacio',
          districts: [
            { name: 'Chirinos' },
            { name: 'Huarango' },
            { name: 'La Coipa' },
            { name: 'Namballe' },
            { name: 'San Ignacio' },
            { name: 'San José de Lourdes' },
            { name: 'Tabaconas' },
          ],
        },
        {
          name: 'San Marcos',
          districts: [
            { name: 'Chancay' },
            { name: 'Eduardo Villanueva' },
            { name: 'Gregorio Pita' },
            { name: 'Ichocan' },
            { name: 'José Manuel Quiroz' },
            { name: 'José Sabogal' },
            { name: 'Pedro Gálvez' },
          ],
        },
        {
          name: 'San Miguel',
          districts: [
            { name: 'Bolívar' },
            { name: 'Calquis' },
            { name: 'Catilluc' },
            { name: 'El Prado' },
            { name: 'La Florida' },
            { name: 'Llapa' },
            { name: 'Nanchoc' },
            { name: 'Niepos' },
            { name: 'San Gregorio' },
            { name: 'San Miguel' },
            { name: 'San Silvestre de Cochan' },
            { name: 'Tongod' },
            { name: 'Unión Agua Blanca' },
          ],
        },
        {
          name: 'San Pablo',
          districts: [{ name: 'San Bernardino' }, { name: 'San Luis' }, { name: 'San Pablo' }, { name: 'Tumbaden' }],
        },
        {
          name: 'Santa Cruz',
          districts: [
            { name: 'Andabamba' },
            { name: 'Catache' },
            { name: 'Chancaybaños' },
            { name: 'La Esperanza' },
            { name: 'Ninabamba' },
            { name: 'Pulan' },
            { name: 'Santa Cruz' },
            { name: 'Saucepampa' },
            { name: 'Sexi' },
            { name: 'Uticyacu' },
            { name: 'Yauyucan' },
          ],
        },
      ],
    },
    {
      name: 'Callao',
      provinces: [
        {
          name: 'Prov. Const. del Callao',
          districts: [
            { name: 'Bellavista' },
            { name: 'Callao' },
            { name: 'Carmen de la Legua Reynoso' },
            { name: 'La Perla' },
            { name: 'La Punta' },
            { name: 'Mi Perú' },
            { name: 'Ventanilla' },
          ],
        },
      ],
    },
    {
      name: 'Cusco',
      provinces: [
        {
          name: 'Acomayo',
          districts: [
            { name: 'Acomayo' },
            { name: 'Acopia' },
            { name: 'Acos' },
            { name: 'Mosoc Llacta' },
            { name: 'Pomacanchi' },
            { name: 'Rondocan' },
            { name: 'Sangarara' },
          ],
        },
        {
          name: 'Anta',
          districts: [
            { name: 'Ancahuasi' },
            { name: 'Anta' },
            { name: 'Cachimayo' },
            { name: 'Chinchaypujio' },
            { name: 'Huarocondo' },
            { name: 'Limatambo' },
            { name: 'Mollepata' },
            { name: 'Pucyura' },
            { name: 'Zurite' },
          ],
        },
        {
          name: 'Calca',
          districts: [
            { name: 'Calca' },
            { name: 'Coya' },
            { name: 'Lamay' },
            { name: 'Lares' },
            { name: 'Pisac' },
            { name: 'San Salvador' },
            { name: 'Taray' },
            { name: 'Yanatile' },
          ],
        },
        {
          name: 'Canas',
          districts: [
            { name: 'Checca' },
            { name: 'Kunturkanki' },
            { name: 'Langui' },
            { name: 'Layo' },
            { name: 'Pampamarca' },
            { name: 'Quehue' },
            { name: 'Tupac Amaru' },
            { name: 'Yanaoca' },
          ],
        },
        {
          name: 'Canchis',
          districts: [
            { name: 'Checacupe' },
            { name: 'Combapata' },
            { name: 'Marangani' },
            { name: 'Pitumarca' },
            { name: 'San Pablo' },
            { name: 'San Pedro' },
            { name: 'Sicuani' },
            { name: 'Tinta' },
          ],
        },
        {
          name: 'Chumbivilcas',
          districts: [
            { name: 'Ccapacmarca' },
            { name: 'Chamaca' },
            { name: 'Colquemarca' },
            { name: 'Livitaca' },
            { name: 'Llusco' },
            { name: 'Quiñota' },
            { name: 'Santo Tomas' },
            { name: 'Velille' },
          ],
        },
        {
          name: 'Cusco',
          districts: [
            { name: 'Ccorca' },
            { name: 'Cusco' },
            { name: 'Poroy' },
            { name: 'San Jerónimo' },
            { name: 'San Sebastian' },
            { name: 'Santiago' },
            { name: 'Saylla' },
            { name: 'Wanchaq' },
          ],
        },
        {
          name: 'Espinar',
          districts: [
            { name: 'Alto Pichigua' },
            { name: 'Condoroma' },
            { name: 'Coporaque' },
            { name: 'Espinar' },
            { name: 'Ocoruro' },
            { name: 'Pallpata' },
            { name: 'Pichigua' },
            { name: 'Suyckutambo' },
          ],
        },
        {
          name: 'La Convención',
          districts: [
            { name: 'Echarate' },
            { name: 'Huayopata' },
            { name: 'Inkawasi' },
            { name: 'Kimbiri' },
            { name: 'Maranura' },
            { name: 'Megantoni' },
            { name: 'Ocobamba' },
            { name: 'Pichari' },
            { name: 'Quellouno' },
            { name: 'Santa Ana' },
            { name: 'Santa Teresa' },
            { name: 'Vilcabamba' },
            { name: 'Villa Kintiarina' },
            { name: 'Villa Virgen' },
          ],
        },
        {
          name: 'Paruro',
          districts: [
            { name: 'Accha' },
            { name: 'Ccapi' },
            { name: 'Colcha' },
            { name: 'Huanoquite' },
            { name: 'Omacha' },
            { name: 'Paccaritambo' },
            { name: 'Paruro' },
            { name: 'Pillpinto' },
            { name: 'Yaurisque' },
          ],
        },
        {
          name: 'Paucartambo',
          districts: [
            { name: 'Caicay' },
            { name: 'Challabamba' },
            { name: 'Colquepata' },
            { name: 'Huancarani' },
            { name: 'Kosñipata' },
            { name: 'Paucartambo' },
          ],
        },
        {
          name: 'Quispicanchi',
          districts: [
            { name: 'Andahuaylillas' },
            { name: 'Camanti' },
            { name: 'Ccarhuayo' },
            { name: 'Ccatca' },
            { name: 'Cusipata' },
            { name: 'Huaro' },
            { name: 'Lucre' },
            { name: 'Marcapata' },
            { name: 'Ocongate' },
            { name: 'Oropesa' },
            { name: 'Quiquijana' },
            { name: 'Urcos' },
          ],
        },
        {
          name: 'Urubamba',
          districts: [
            { name: 'Chinchero' },
            { name: 'Huayllabamba' },
            { name: 'Machupicchu' },
            { name: 'Maras' },
            { name: 'Ollantaytambo' },
            { name: 'Urubamba' },
            { name: 'Yucay' },
          ],
        },
      ],
    },
    {
      name: 'Huancavelica',
      provinces: [
        {
          name: 'Acobamba',
          districts: [
            { name: 'Acobamba' },
            { name: 'Andabamba' },
            { name: 'Anta' },
            { name: 'Caja' },
            { name: 'Marcas' },
            { name: 'Paucara' },
            { name: 'Pomacocha' },
            { name: 'Rosario' },
          ],
        },
        {
          name: 'Angaraes',
          districts: [
            { name: 'Anchonga' },
            { name: 'Callanmarca' },
            { name: 'Ccochaccasa' },
            { name: 'Chincho' },
            { name: 'Congalla' },
            { name: 'Huanca-Huanca' },
            { name: 'Huayllay Grande' },
            { name: 'Julcamarca' },
            { name: 'Lircay' },
            { name: 'San Antonio de Antaparco' },
            { name: 'Santo Tomas de Pata' },
            { name: 'Secclla' },
          ],
        },
        {
          name: 'Castrovirreyna',
          districts: [
            { name: 'Arma' },
            { name: 'Aurahua' },
            { name: 'Capillas' },
            { name: 'Castrovirreyna' },
            { name: 'Chupamarca' },
            { name: 'Cocas' },
            { name: 'Huachos' },
            { name: 'Huamatambo' },
            { name: 'Mollepampa' },
            { name: 'San Juan' },
            { name: 'Santa Ana' },
            { name: 'Tantara' },
            { name: 'Ticrapo' },
          ],
        },
        {
          name: 'Churcampa',
          districts: [
            { name: 'Anco' },
            { name: 'Chinchihuasi' },
            { name: 'Churcampa' },
            { name: 'Cosme' },
            { name: 'El Carmen' },
            { name: 'La Merced' },
            { name: 'Locroja' },
            { name: 'Pachamarca' },
            { name: 'Paucarbamba' },
            { name: 'San Miguel de Mayocc' },
            { name: 'San Pedro de Coris' },
          ],
        },
        {
          name: 'Huancavelica',
          districts: [
            { name: 'Acobambilla' },
            { name: 'Acoria' },
            { name: 'Ascensión' },
            { name: 'Conayca' },
            { name: 'Cuenca' },
            { name: 'Huachocolpa' },
            { name: 'Huancavelica' },
            { name: 'Huando' },
            { name: 'Huayllahuara' },
            { name: 'Izcuchaca' },
            { name: 'Laria' },
            { name: 'Manta' },
            { name: 'Mariscal Caceres' },
            { name: 'Moya' },
            { name: 'Nuevo Occoro' },
            { name: 'Palca' },
            { name: 'Pilchaca' },
            { name: 'Vilca' },
            { name: 'Yauli' },
          ],
        },
        {
          name: 'Huaytará',
          districts: [
            { name: 'Ayavi' },
            { name: 'Córdova' },
            { name: 'Huayacundo Arma' },
            { name: 'Huaytara' },
            { name: 'Laramarca' },
            { name: 'Ocoyo' },
            { name: 'Pilpichaca' },
            { name: 'Querco' },
            { name: 'Quito-Arma' },
            { name: 'San Antonio de Cusicancha' },
            { name: 'San Francisco de Sangayaico' },
            { name: 'San Isidro' },
            { name: 'Santiago de Chocorvos' },
            { name: 'Santiago de Quirahuara' },
            { name: 'Santo Domingo de Capillas' },
            { name: 'Tambo' },
          ],
        },
        {
          name: 'Tayacaja',
          districts: [
            { name: 'Acostambo' },
            { name: 'Acraquia' },
            { name: 'Ahuaycha' },
            { name: 'Andaymarca' },
            { name: 'Colcabamba' },
            { name: 'Daniel Hernández' },
            { name: 'Huachocolpa' },
            { name: 'Huaribamba' },
            { name: 'Ñahuimpuquio' },
            { name: 'Pampas' },
            { name: 'Pazos' },
            { name: 'Quichuas' },
            { name: 'Quishuar' },
            { name: 'Roble' },
            { name: 'Salcabamba' },
            { name: 'Salcahuasi' },
            { name: 'San Marcos de Rocchac' },
            { name: 'Santiago de Tucuma' },
            { name: 'Surcubamba' },
            { name: 'Tintay Puncu' },
          ],
        },
      ],
    },
    {
      name: 'Huánuco',
      provinces: [
        {
          name: 'Ambo',
          districts: [
            { name: 'Ambo' },
            { name: 'Cayna' },
            { name: 'Colpas' },
            { name: 'Conchamarca' },
            { name: 'Huacar' },
            { name: 'San Francisco' },
            { name: 'San Rafael' },
            { name: 'Tomay Kichwa' },
          ],
        },
        {
          name: 'Dos de Mayo',
          districts: [
            { name: 'Chuquis' },
            { name: 'La Unión' },
            { name: 'Marías' },
            { name: 'Pachas' },
            { name: 'Quivilla' },
            { name: 'Ripan' },
            { name: 'Shunqui' },
            { name: 'Sillapata' },
            { name: 'Yanas' },
          ],
        },
        {
          name: 'Huacaybamba',
          districts: [{ name: 'Canchabamba' }, { name: 'Cochabamba' }, { name: 'Huacaybamba' }, { name: 'Pinra' }],
        },
        {
          name: 'Huamalíes',
          districts: [
            { name: 'Arancay' },
            { name: 'Chavín de Pariarca' },
            { name: 'Jacas Grande' },
            { name: 'Jircan' },
            { name: 'Llata' },
            { name: 'Miraflores' },
            { name: 'Monzón' },
            { name: 'Puños' },
            { name: 'Singa' },
            { name: 'Tantamayo' },
          ],
        },
        {
          name: 'Huánuco',
          districts: [
            { name: 'Amarilis' },
            { name: 'Chinchao' },
            { name: 'Churubamba' },
            { name: 'Huánuco' },
            { name: 'Margos' },
            { name: 'Pillco Marca' },
            { name: 'Quisqui' },
            { name: 'San Francisco de Cayran' },
            { name: 'San Pedro de Chaulan' },
            { name: 'Santa María del Valle' },
            { name: 'Yarumayo' },
          ],
        },
        {
          name: 'Lauricocha',
          districts: [
            { name: 'Baños' },
            { name: 'Jesús' },
            { name: 'Jivia' },
            { name: 'Queropalca' },
            { name: 'Rondos' },
            { name: 'San Francisco de Asís' },
            { name: 'San Miguel de Cauri' },
          ],
        },
        {
          name: 'Leoncio Prado',
          districts: [
            { name: 'Castillo Grande' },
            { name: 'Daniel Alomias Robles' },
            { name: 'Hermilio Valdizan' },
            { name: 'José Crespo y Castillo' },
            { name: 'Luyando' },
            { name: 'Mariano Damaso Beraun' },
            { name: 'Pucayacu' },
            { name: 'Pueblo Nuevo' },
            { name: 'Rupa-Rupa' },
            { name: 'Santo Domingo de Anda' },
          ],
        },
        {
          name: 'Marañón',
          districts: [{ name: 'Cholón' }, { name: 'Huacrachuco' }, { name: 'San Buenaventura' }],
        },
        {
          name: 'Pachitea',
          districts: [{ name: 'Chaglla' }, { name: 'Molino' }, { name: 'Panao' }, { name: 'Umari' }],
        },
        {
          name: 'Puerto Inca',
          districts: [
            { name: 'Codo del Pozuzo' },
            { name: 'Honoria' },
            { name: 'Puerto Inca' },
            { name: 'Tournavista' },
            { name: 'Yuyapichis' },
          ],
        },
        {
          name: 'Yarowilca',
          districts: [
            { name: 'Aparicio Pomares' },
            { name: 'Cabanilla' },
            { name: 'Cahuac' },
            { name: 'Chacabamba' },
            { name: 'Chavinillo' },
            { name: 'Choras' },
            { name: 'Jacas Chico' },
            { name: 'Obas' },
          ],
        },
      ],
    },
    {
      name: 'Ica',
      provinces: [
        {
          name: 'Chincha',
          districts: [
            { name: 'Alto Laran' },
            { name: 'Chavin' },
            { name: 'Chincha Alta' },
            { name: 'Chincha Baja' },
            { name: 'El Carmen' },
            { name: 'Grocio Prado' },
            { name: 'Pueblo Nuevo' },
            { name: 'San Juan de Yanac' },
            { name: 'San Pedro de Huacarpana' },
            { name: 'Sunampe' },
            { name: 'Tambo de Mora' },
          ],
        },
        {
          name: 'Ica',
          districts: [
            { name: 'Ica' },
            { name: 'La Tinguiña' },
            { name: 'Los Aquijes' },
            { name: 'Ocucaje' },
            { name: 'Pachacutec' },
            { name: 'Parcona' },
            { name: 'Pueblo Nuevo' },
            { name: 'Salas' },
            { name: 'San José de Los Molinos' },
            { name: 'San Juan Bautista' },
            { name: 'Santiago' },
            { name: 'Subtanjalla' },
            { name: 'Tate' },
            { name: 'Yauca del Rosario' },
          ],
        },
        {
          name: 'Nazca',
          districts: [{ name: 'Changuillo' }, { name: 'El Ingenio' }, { name: 'Marcona' }, { name: 'Nazca' }, { name: 'Vista Alegre' }],
        },
        {
          name: 'Palpa',
          districts: [{ name: 'Llipata' }, { name: 'Palpa' }, { name: 'Río Grande' }, { name: 'Santa Cruz' }, { name: 'Tibillo' }],
        },
        {
          name: 'Pisco',
          districts: [
            { name: 'Huancano' },
            { name: 'Humay' },
            { name: 'Independencia' },
            { name: 'Paracas' },
            { name: 'Pisco' },
            { name: 'San Andrés' },
            { name: 'San Clemente' },
            { name: 'Tupac Amaru Inca' },
          ],
        },
      ],
    },
    {
      name: 'Junín',
      provinces: [
        {
          name: 'Chanchamayo',
          districts: [
            { name: 'Chanchamayo' },
            { name: 'Perene' },
            { name: 'Pichanaqui' },
            { name: 'San Luis de Shuaro' },
            { name: 'San Ramón' },
            { name: 'Vitoc' },
          ],
        },
        {
          name: 'Chupaca',
          districts: [
            { name: 'Ahuac' },
            { name: 'Chongos Bajo' },
            { name: 'Chupaca' },
            { name: 'Huachac' },
            { name: 'Huamancaca Chico' },
            { name: 'San Juan de Iscos' },
            { name: 'San Juan de Jarpa' },
            { name: 'Tres de Diciembre' },
            { name: 'Yanacancha' },
          ],
        },
        {
          name: 'Concepción',
          districts: [
            { name: 'Aco' },
            { name: 'Andamarca' },
            { name: 'Chambara' },
            { name: 'Cochas' },
            { name: 'Comas' },
            { name: 'Concepción' },
            { name: 'Heroínas Toledo' },
            { name: 'Manzanares' },
            { name: 'Mariscal Castilla' },
            { name: 'Matahuasi' },
            { name: 'Mito' },
            { name: 'Nueve de Julio' },
            { name: 'Orcotuna' },
            { name: 'San José de Quero' },
            { name: 'Santa Rosa de Ocopa' },
          ],
        },
        {
          name: 'Huancayo',
          districts: [
            { name: 'Carhuacallanga' },
            { name: 'Chacapampa' },
            { name: 'Chicche' },
            { name: 'Chilca' },
            { name: 'Chongos Alto' },
            { name: 'Chupuro' },
            { name: 'Colca' },
            { name: 'Cullhuas' },
            { name: 'El Tambo' },
            { name: 'Huacrapuquio' },
            { name: 'Hualhuas' },
            { name: 'Huancan' },
            { name: 'Huancayo' },
            { name: 'Huasicancha' },
            { name: 'Huayucachi' },
            { name: 'Ingenio' },
            { name: 'Pariahuanca' },
            { name: 'Pilcomayo' },
            { name: 'Pucara' },
            { name: 'Quichuay' },
            { name: 'Quilcas' },
            { name: 'San Agustín' },
            { name: 'San Jerónimo de Tunan' },
            { name: 'Santo Domingo de Acobamba' },
            { name: 'Saño' },
            { name: 'Sapallanga' },
            { name: 'Sicaya' },
            { name: 'Viques' },
          ],
        },
        {
          name: 'Jauja',
          districts: [
            { name: 'Acolla' },
            { name: 'Apata' },
            { name: 'Ataura' },
            { name: 'Canchayllo' },
            { name: 'Curicaca' },
            { name: 'El Mantaro' },
            { name: 'Huamali' },
            { name: 'Huaripampa' },
            { name: 'Huertas' },
            { name: 'Janjaillo' },
            { name: 'Jauja' },
            { name: 'Julcan' },
            { name: 'Leonor Ordóñez' },
            { name: 'Llocllapampa' },
            { name: 'Marco' },
            { name: 'Masma' },
            { name: 'Masma Chicche' },
            { name: 'Molinos' },
            { name: 'Monobamba' },
            { name: 'Muqui' },
            { name: 'Muquiyauyo' },
            { name: 'Paca' },
            { name: 'Paccha' },
            { name: 'Pancan' },
            { name: 'Parco' },
            { name: 'Pomacancha' },
            { name: 'Ricran' },
            { name: 'San Lorenzo' },
            { name: 'San Pedro de Chunan' },
            { name: 'Sausa' },
            { name: 'Sincos' },
            { name: 'Tunan Marca' },
            { name: 'Yauli' },
            { name: 'Yauyos' },
          ],
        },
        {
          name: 'Junín',
          districts: [{ name: 'Carhuamayo' }, { name: 'Junín' }, { name: 'Ondores' }, { name: 'Ulcumayo' }],
        },
        {
          name: 'Satipo',
          districts: [
            { name: 'Coviriali' },
            { name: 'Llaylla' },
            { name: 'Mazamari' },
            { name: 'Pampa Hermosa' },
            { name: 'Pangoa' },
            { name: 'Río Negro' },
            { name: 'Río Tambo' },
            { name: 'Satipo' },
          ],
        },
        {
          name: 'Tarma',
          districts: [
            { name: 'Acobamba' },
            { name: 'Huaricolca' },
            { name: 'Huasahuasi' },
            { name: 'La Unión' },
            { name: 'Palca' },
            { name: 'Palcamayo' },
            { name: 'San Pedro de Cajas' },
            { name: 'Tapo' },
            { name: 'Tarma' },
          ],
        },
        {
          name: 'Yauli',
          districts: [
            { name: 'Chacapalpa' },
            { name: 'Huay-Huay' },
            { name: 'La Oroya' },
            { name: 'Marcapomacocha' },
            { name: 'Morococha' },
            { name: 'Paccha' },
            { name: 'Santa Barbara de Carhuacayan' },
            { name: 'Santa Rosa de Sacco' },
            { name: 'Suitucancha' },
            { name: 'Yauli' },
          ],
        },
      ],
    },
    {
        name: 'La Libertad',
        provinces: [
          {
            name: 'Trujillo',
            districts: [
              { name: 'Trujillo' }, { name: 'El Porvenir' }, { name: 'Florencia de Mora' }, { name: 'Huanchaco' },
              { name: 'La Esperanza' }, { name: 'Laredo' }, { name: 'Moche' }, { name: 'Poroto' },
              { name: 'Salaverry' }, { name: 'Simbal' }, { name: 'Victor Larco Herrera' }
            ]
          },
          {
            name: 'Ascope',
            districts: [
              { name: 'Ascope' }, { name: 'Chicama' }, { name: 'Chocope' }, { name: 'Magdalena de Cao' },
              { name: 'Paijan' }, { name: 'Rázuri' }, { name: 'Santiago de Cao' }, { name: 'Casa Grande' }
            ]
          },
          {
            name: 'Bolívar',
            districts: [
              { name: 'Bolívar' }, { name: 'Bambamarca' }, { name: 'Condormarca' }, { name: 'Longotea' },
              { name: 'Uchumarca' }, { name: 'Ucuncha' }
            ]
          },
          {
            name: 'Chepén',
            districts: [ { name: 'Chepén' }, { name: 'Pacanga' }, { name: 'Pueblo Nuevo' } ]
          },
          {
            name: 'Julcán',
            districts: [ { name: 'Julcán' }, { name: 'Calamarca' }, { name: 'Carabamba' }, { name: 'Huaso' } ]
          },
          {
            name: 'Otuzco',
            districts: [
              { name: 'Otuzco' }, { name: 'Agallpampa' }, { name: 'Charat' }, { name: 'Huaranchal' },
              { name: 'La Cuesta' }, { name: 'Mache' }, { name: 'Paranday' }, { name: 'Salpo' },
              { name: 'Sinsicap' }, { name: 'Usquil' }
            ]
          },
          {
            name: 'Pacasmayo',
            districts: [
              { name: 'San Pedro de Lloc' }, { name: 'Guadalupe' }, { name: 'Jequetepeque' },
              { name: 'Pacasmayo' }, { name: 'San José' }
            ]
          },
          {
            name: 'Pataz',
            districts: [
              { name: 'Tayabamba' }, { name: 'Buldibuyo' }, { name: 'Chilia' }, { name: 'Huancaspata' },
              { name: 'Huaylillas' }, { name: 'Huayo' }, { name: 'Ongon' }, { name: 'Parcoy' },
              { name: 'Pataz' }, { name: 'Pias' }, { name: 'Santiago de Challas' }, { name: 'Taurija' },
              { name: 'Urpay' }
            ]
          },
          {
            name: 'Sánchez Carrión',
            districts: [
              { name: 'Huamachuco' }, { name: 'Chugay' }, { name: 'Cochorco' }, { name: 'Curgos' },
              { name: 'Marcabal' }, { name: 'Sanagoran' }, { name: 'Sarin' }, { name: 'Sartimbamba' }
            ]
          },
          {
            name: 'Santiago de Chuco',
            districts: [
              { name: 'Santiago de Chuco' }, { name: 'Angasmarca' }, { name: 'Cachicadan' }, { name: 'Mollebamba' },
              { name: 'Mollepata' }, { name: 'Quiruvilca' }, { name: 'Santa Cruz de Chuca' }, { name: 'Sitabamba' }
            ]
          },
          {
            name: 'Gran Chimú',
            districts: [ { name: 'Cascas' }, { name: 'Lucma' }, { name: 'Marmot' }, { name: 'Sayapullo' } ]
          },
          {
            name: 'Virú',
            districts: [ { name: 'Virú' }, { name: 'Chao' }, { name: 'Guadalupito' } ]
          }
        ]
      },
      {
        name: 'Lambayeque',
        provinces: [
          {
            name: 'Chiclayo',
            districts: [
              { name: 'Chiclayo' }, { name: 'Chongoyape' }, { name: 'Eten' }, { name: 'Eten Puerto' },
              { name: 'Jose Leonardo Ortiz' }, { name: 'La Victoria' }, { name: 'Lagunas' }, { name: 'Monsefu' },
              { name: 'Nueva Arica' }, { name: 'Oyotun' }, { name: 'Picsi' }, { name: 'Pimentel' },
              { name: 'Reque' }, { name: 'Santa Rosa' }, { name: 'Saña' }, { name: 'Cayalti' },
              { name: 'Patapo' }, { name: 'Pomalca' }, { name: 'Pucala' }, { name: 'Tuman' }
            ]
          },
          {
            name: 'Ferreñafe',
            districts: [
              { name: 'Ferreñafe' }, { name: 'Cañaris' }, { name: 'Incahuasi' },
              { name: 'Manuel Antonio Mesones Muro' }, { name: 'Pitipo' }, { name: 'Pueblo Nuevo' }
            ]
          },
          {
            name: 'Lambayeque',
            districts: [
              { name: 'Lambayeque' }, { name: 'Chochope' }, { name: 'Illimo' }, { name: 'Jayanca' },
              { name: 'Mochumi' }, { name: 'Morrope' }, { name: 'Motupe' }, { name: 'Olmos' },
              { name: 'Pacora' }, { name: 'Salas' }, { name: 'San Jose' }, { name: 'Tucume' }
            ]
          }
        ]
      },
      {
        name: 'Lima',
        provinces: [
          {
            name: 'Lima',
            districts: [
              { name: 'Lima' }, { name: 'Ancón' }, { name: 'Ate' }, { name: 'Barranco' }, { name: 'Breña' },
              { name: 'Carabayllo' }, { name: 'Chaclacayo' }, { name: 'Chorrillos' }, { name: 'Cieneguilla' },
              { name: 'Comas' }, { name: 'El Agustino' }, { name: 'Independencia' }, { name: 'Jesus Maria' },
              { name: 'La Molina' }, { name: 'La Victoria' }, { name: 'Lince' }, { name: 'Los Olivos' },
              { name: 'Lurigancho' }, { name: 'Lurin' }, { name: 'Magdalena del Mar' }, { name: 'Pueblo Libre' },
              { name: 'Miraflores' }, { name: 'Pachacamac' }, { name: 'Pucusana' }, { name: 'Puente Piedra' },
              { name: 'Punta Hermosa' }, { name: 'Punta Negra' }, { name: 'Rimac' }, { name: 'San Bartolo' },
              { name: 'San Borja' }, { name: 'San Isidro' }, { name: 'San Juan de Lurigancho' },
              { name: 'San Juan de Miraflores' }, { name: 'San Luis' }, { name: 'San Martin de Porres' },
              { name: 'San Miguel' }, { name: 'Santa Anita' }, { name: 'Santa Maria del Mar' }, { name: 'Santa Rosa' },
              { name: 'Santiago de Surco' }, { name: 'Surquillo' }, { name: 'Villa El Salvador' },
              { name: 'Villa Maria del Triunfo' }
            ]
          },
          { name: 'Barranca', districts: [ /* ... 5 distritos ... */ ] },
          { name: 'Cajatambo', districts: [ /* ... 5 distritos ... */ ] },
          { name: 'Canta', districts: [ /* ... 7 distritos ... */ ] },
          { name: 'Cañete', districts: [ /* ... 16 distritos ... */ ] },
          { name: 'Huaral', districts: [ /* ... 12 distritos ... */ ] },
          { name: 'Huarochirí', districts: [ /* ... 32 distritos ... */ ] },
          { name: 'Huaura', districts: [ /* ... 12 distritos ... */ ] },
          { name: 'Oyón', districts: [ /* ... 6 distritos ... */ ] },
          { name: 'Yauyos', districts: [ /* ... 33 distritos ... */ ] }
        ]
      },
      {
        name: 'Loreto',
        provinces: [
          {
            name: 'Maynas',
            districts: [
              { name: 'Iquitos' }, { name: 'Alto Nanay' }, { name: 'Fernando Lores' }, { name: 'Indiana' },
              { name: 'Las Amazonas' }, { name: 'Mazan' }, { name: 'Napo' }, { name: 'Punchana' },
              { name: 'Torres Causana' }, { name: 'Belén' }, { name: 'San Juan Bautista' }
            ]
          },
          { name: 'Alto Amazonas', districts: [ /* ... 6 distritos ... */ ] },
          { name: 'Loreto', districts: [ /* ... 5 distritos ... */ ] },
          { name: 'Mariscal Ramón Castilla', districts: [ /* ... 4 distritos ... */ ] },
          { name: 'Requena', districts: [ /* ... 11 distritos ... */ ] },
          { name: 'Ucayali', districts: [ /* ... 6 distritos ... */ ] },
          { name: 'Datem del Marañón', districts: [ /* ... 6 distritos ... */ ] },
          { name: 'Putumayo', districts: [ /* ... 4 distritos ... */ ] }
        ]
      },
      {
        name: 'Madre de Dios',
        provinces: [
          {
            name: 'Tambopata',
            districts: [ { name: 'Tambopata' }, { name: 'Inambari' }, { name: 'Las Piedras' }, { name: 'Laberinto' } ]
          },
          { name: 'Manu', districts: [ { name: 'Manu' }, { name: 'Fitzcarrald' }, { name: 'Madre de Dios' }, { name: 'Huepetuhe' } ] },
          { name: 'Tahuamanu', districts: [ { name: 'Iñapari' }, { name: 'Iberia' }, { name: 'Tahuamanu' } ] }
        ]
      },
      {
        name: 'Moquegua',
        provinces: [
          {
            name: 'Mariscal Nieto',
            districts: [ { name: 'Moquegua' }, { name: 'Carumas' }, { name: 'Cuchumbaya' }, { name: 'Samegua' }, { name: 'San Cristóbal' }, { name: 'Torata' } ]
          },
          {
            name: 'General Sánchez Cerro',
            districts: [
              { name: 'Omate' }, { name: 'Chojata' }, { name: 'Coalaque' }, { name: 'Ichuña' },
              { name: 'La Capilla' }, { name: 'Lloque' }, { name: 'Matalaque' }, { name: 'Puquina' },
              { name: 'Quinistaquillas' }, { name: 'Ubinas' }, { name: 'Yunga' }
            ]
          },
          { name: 'Ilo', districts: [ { name: 'Ilo' }, { name: 'El Algarrobal' }, { name: 'Pacocha' } ] }
        ]
      },
      {
        name: 'Pasco',
        provinces: [
          {
            name: 'Pasco',
            districts: [
              { name: 'Chaupimarca' }, { name: 'Huachon' }, { name: 'Huariaca' }, { name: 'Huayllay' },
              { name: 'Ninacaca' }, { name: 'Pallanchacra' }, { name: 'Paucartambo' }, { name: 'San Francisco de Asís de Yarusyacan' },
              { name: 'Simon Bolivar' }, { name: 'Ticlacayan' }, { name: 'Tinyahuarco' }, { name: 'Vicco' },
              { name: 'Yanacancha' }
            ]
          },
          {
            name: 'Daniel Alcides Carrión',
            districts: [
              { name: 'Yanahuanca' }, { name: 'Chacayan' }, { name: 'Goyllarisquizga' }, { name: 'Paucar' },
              { name: 'San Pedro de Pillao' }, { name: 'Santa Ana de Tusi' }, { name: 'Tapuc' }, { name: 'Vilcabamba' }
            ]
          },
          {
            name: 'Oxapampa',
            districts: [
              { name: 'Oxapampa' }, { name: 'Chontabamba' }, { name: 'Huancabamba' }, { name: 'Palcazu' },
              { name: 'Pozuzo' }, { name: 'Puerto Bermudez' }, { name: 'Villa Rica' }, { name: 'Constitución' }
            ]
          }
        ]
      },
      {
        name: 'Piura',
        provinces: [
          {
            name: 'Piura',
            districts: [
              { name: 'Piura' }, { name: 'Castilla' }, { name: 'Catacaos' }, { name: 'Cura Mori' },
              { name: 'El Tallan' }, { name: 'La Arena' }, { name: 'La Union' }, { name: 'Las Lomas' },
              { name: 'Tambo Grande' }, { name: 'Veintiseis de Octubre' }
            ]
          },
          { name: 'Ayabaca', districts: [ /* ... 10 distritos ... */ ] },
          { name: 'Huancabamba', districts: [ /* ... 8 distritos ... */ ] },
          { name: 'Morropón', districts: [ /* ... 10 distritos ... */ ] },
          { name: 'Paita', districts: [ /* ... 7 distritos ... */ ] },
          { name: 'Sullana', districts: [ /* ... 8 distritos ... */ ] },
          { name: 'Talara', districts: [ /* ... 6 distritos ... */ ] },
          { name: 'Sechura', districts: [ /* ... 6 distritos ... */ ] }
        ]
      },
      {
        name: 'Puno',
        provinces: [
          {
            name: 'Puno',
            districts: [
              { name: 'Puno' }, { name: 'Acora' }, { name: 'Amantani' }, { name: 'Atuncolla' },
              { name: 'Capachica' }, { name: 'Chucuito' }, { name: 'Coata' }, { name: 'Huata' },
              { name: 'Mañazo' }, { name: 'Paucarcolla' }, { name: 'Pichacani' }, { name: 'Plateria' },
              { name: 'San Antonio' }, { name: 'Tiquillaca' }, { name: 'Vilque' }
            ]
          },
          { name: 'Azángaro', districts: [ /* ... 15 distritos ... */ ] },
          { name: 'Carabaya', districts: [ /* ... 10 distritos ... */ ] },
          { name: 'Chucuito', districts: [ /* ... 7 distritos ... */ ] },
          { name: 'El Collao', districts: [ /* ... 5 distritos ... */ ] },
          { name: 'Huancané', districts: [ /* ... 8 distritos ... */ ] },
          { name: 'Lampa', districts: [ /* ... 10 distritos ... */ ] },
          { name: 'Melgar', districts: [ /* ... 9 distritos ... */ ] },
          { name: 'Moho', districts: [ /* ... 4 distritos ... */ ] },
          { name: 'San Antonio de Putina', districts: [ /* ... 5 distritos ... */ ] },
          { name: 'San Román', districts: [ /* ... 5 distritos ... */ ] },
          { name: 'Sandia', districts: [ /* ... 10 distritos ... */ ] },
          { name: 'Yunguyo', districts: [ /* ... 7 distritos ... */ ] }
        ]
      },
      {
        name: 'San Martín',
        provinces: [
          {
            name: 'Moyobamba',
            districts: [
              { name: 'Moyobamba' }, { name: 'Calzada' }, { name: 'Habana' },
              { name: 'Jepelacio' }, { name: 'Soritor' }, { name: 'Yantalo' }
            ]
          },
          { name: 'Bellavista', districts: [ /* ... 6 distritos ... */ ] },
          { name: 'El Dorado', districts: [ /* ... 5 distritos ... */ ] },
          { name: 'Huallaga', districts: [ /* ... 6 distritos ... */ ] },
          { name: 'Lamas', districts: [ /* ... 11 distritos ... */ ] },
          { name: 'Mariscal Cáceres', districts: [ /* ... 6 distritos ... */ ] },
          { name: 'Picota', districts: [ /* ... 10 distritos ... */ ] },
          { name: 'Rioja', districts: [ /* ... 9 distritos ... */ ] },
          { name: 'San Martín', districts: [ /* ... 14 distritos ... */ ] },
          { name: 'Tocache', districts: [ /* ... 6 distritos ... */ ] }
        ]
      },
      {
        name: 'Tacna',
        provinces: [
          {
            name: 'Tacna',
            districts: [
              { name: 'Tacna' }, { name: 'Alto de la Alianza' }, { name: 'Calana' }, { name: 'Ciudad Nueva' },
              { name: 'Coronel Gregorio Albarracín Lanchipa' }, { name: 'Inclan' }, { name: 'Pachia' },
              { name: 'Palca' }, { name: 'Pocollay' }, { name: 'Sama' }, { name: 'La Yarada los Palos' }
            ]
          },
          { name: 'Candarave', districts: [ { name: 'Candarave' }, { name: 'Cairani' }, { name: 'Camilaca' }, { name: 'Curibaya' }, { name: 'Huanuara' }, { name: 'Quilahuani' } ] },
          { name: 'Jorge Basadre', districts: [ { name: 'Locumba' }, { name: 'Ilabaya' }, { name: 'Ite' } ] },
          { name: 'Tarata', districts: [ { name: 'Tarata' }, { name: 'Chucatamani' }, { name: 'Estique' }, { name: 'Estique-Pampa' }, { name: 'Sitajara' }, { name: 'Susapaya' }, { name: 'Tarucachi' }, { name: 'Ticaco' } ] }
        ]
      },
      {
        name: 'Tumbes',
        provinces: [
          {
            name: 'Tumbes',
            districts: [ { name: 'Tumbes' }, { name: 'Corrales' }, { name: 'La Cruz' }, { name: 'Pampas de Hospital' }, { name: 'San Jacinto' }, { name: 'San Juan de la Virgen' } ]
          },
          { name: 'Contralmirante Villar', districts: [ { name: 'Zorritos' }, { name: 'Casitas' }, { name: 'Canoas de Punta Sal' } ] },
          { name: 'Zarumilla', districts: [ { name: 'Zarumilla' }, { name: 'Aguas Verdes' }, { name: 'Matapalo' }, { name: 'Papayal' } ] }
        ]
      },
      {
        name: 'Ucayali',
        provinces: [
          {
            name: 'Coronel Portillo',
            districts: [
              { name: 'Calleria' }, { name: 'Campoverde' }, { name: 'Iparia' },
              { name: 'Masisea' }, { name: 'Yarinacocha' }, { name: 'Nueva Requena' }, { name: 'Manantay' }
            ]
          },
          { name: 'Atalaya', districts: [ { name: 'Raimondi' }, { name: 'Sepahua' }, { name: 'Tahuania' }, { name: 'Yurua' } ] },
          { name: 'Padre Abad', districts: [ { name: 'Padre Abad' }, { name: 'Irazola' }, { name: 'Curimana' }, { name: 'Alexander Von Humboldt' }, { name: 'Neshuya' } ] },
          { name: 'Purús', districts: [ { name: 'Purus' } ] }
        ]
      }
    ];