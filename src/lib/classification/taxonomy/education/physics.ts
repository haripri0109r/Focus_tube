import { TaxonomyCategoryModule } from '../../types';
const m: TaxonomyCategoryModule = {
  category: 'PHYSICS', type: 'EDU', version: '1.0.0',
  subtopics: {
    mechanics: { weight: 45, keywords: ['physics','mechanics','classical mechanics','newton laws','kinematics','dynamics','work energy','momentum','circular motion','gravitation','simple harmonic motion','oscillation'] },
    thermodynamics: { weight: 45, keywords: ['thermodynamics','heat','temperature','entropy','enthalpy','carnot cycle','heat engine','gas laws','ideal gas','thermodynamic process'] },
    electromagnetism: { weight: 45, keywords: ['electromagnetism','electric field','magnetic field','faraday law','maxwell equations','electromagnetic wave','capacitor','inductor','circuit','ohm law','kirchhoff'] },
    quantum: { weight: 48, keywords: ['quantum mechanics','quantum physics','wave function','schrodinger','uncertainty principle','quantum entanglement','superposition','qubit','quantum computing'] },
    optics: { weight: 42, keywords: ['optics','light','reflection','refraction','diffraction','interference','lens','mirror','snell law','total internal reflection','laser'] },
    relativity: { weight: 48, keywords: ['relativity','special relativity','general relativity','lorentz transformation','time dilation','length contraction','spacetime','mass energy equivalence','e mc2'] },
  },
};
export default m;
