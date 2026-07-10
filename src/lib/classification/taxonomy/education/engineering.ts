import { TaxonomyCategoryModule } from '../../types';

// Remaining education categories bundled for efficiency
const m: TaxonomyCategoryModule = {
  category: 'ENGINEERING', type: 'EDU', version: '1.0.0',
  subtopics: {
    electrical: { weight: 44, keywords: ['electrical engineering','circuits','circuit analysis','resistor','capacitor','inductor','transistor','amplifier','op amp','digital electronics','logic gates','flip flop','microcontroller','fpga','pcb design','verilog','vhdl'] },
    mechanical: { weight: 44, keywords: ['mechanical engineering','statics','dynamics','strength of materials','thermodynamics mechanical','fluid mechanics','heat transfer','manufacturing','machine design','cad','solidworks','autocad'] },
    civil: { weight: 42, keywords: ['civil engineering','structural engineering','geotechnical','fluid mechanics civil','surveying','concrete','steel structure','reinforcement','foundation'] },
    electronics_iot: { weight: 46, keywords: ['electronics','arduino','raspberry pi','esp32','embedded systems','iot','internet of things','microcontroller','sensor','actuator','i2c','spi','uart','pwm','adc','dac','rtos','freertos'] },
    robotics: { weight: 46, keywords: ['robotics','robot','ros','ros2','robot operating system','servo motor','stepper motor','kinematics','inverse kinematics','path planning','slam','autonomous robot','drone programming','computer vision robot'] },
  },
};
export default m;
