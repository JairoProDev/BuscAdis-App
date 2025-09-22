export default function RegistrationBenefits() {
  const benefits = [
    {
      title: 'Gestiona tus adisos',
      description: 'Edita, renueva o elimina tus adisos cuando quieras'
    },
    {
      title: 'Recibe mensajes',
      description: 'Los compradores podrán contactarte directamente'
    },
    {
      title: 'Guarda favoritos',
      description: 'Guarda los adisos que te interesan para verlos después'
    }
  ];

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Ventajas de crear una cuenta
      </h3>
      <div className="space-y-4">
        {benefits.map((benefit) => (
          <div key={`benefit-${benefit.title.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`} className="flex">
            <svg className="h-6 w-6 text-primary-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-gray-900">{benefit.title}</h4>
              <p className="text-sm text-gray-500">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
