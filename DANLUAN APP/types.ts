
export enum AppSection {
  HOME = 'home',
  PROJECTS = 'projects',
  VERIFICATIONS = 'verifications',
  CALCULATOR = 'calculator',
  TROUBLESHOOTING = 'troubleshooting',
  CHAT = 'chat',
  AUDIT_PANEL = 'audit_panel'
}

export enum AveriaSubSection {
  DIFERENCIALES = 'diferenciales',
  AISLAMIENTO = 'aislamiento',
  IMPEDANCIAS = 'impedancias'
}

export enum ImpedanciaType {
  LINEA = 'linea',
  BUCLE = 'bucle'
}

export enum Manufacturer {
  GENERIC = 'Genérico',
  SCHNEIDER = 'Schneider',
  ABB = 'ABB',
  LEGRAND = 'Legrand'
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface RCDResult { time: string; ma: string; didTrip: boolean; isTested: boolean; }
export interface RCDDevice { id: string; name: string; intensity: string; type: string; results: Record<'x0.5' | 'x1' | 'x5' | 'AUTO', RCDResult>; }
export interface AislamientoResult { id: string; point: string; voltage: number; value: string; unit: 'MΩ' | 'GΩ'; isValid: boolean; timestamp: string; }
export interface ImpedanciaDevice { id: string; name: string; lineValue: string; bucleValue?: string; lineCurve: 'B' | 'C' | 'D'; lineAmps: string; manufacturer: Manufacturer; }
export interface ImpedanciaState { devices: ImpedanciaDevice[]; bucleRa: string; bucleVc: string; isHumid: boolean; }

export interface Project {
  id: string;
  clientName: string;
  date: string;
  lastUpdate: string;
  rcdDevices: RCDDevice[];
  aislamientoHistory: AislamientoResult[];
  impedanciaData: ImpedanciaState;
  troubleshootingMessages: Message[];
  troubleshootingDescription: string;
  isTroubleshootingActive: boolean;
}

export enum TubeManufacturer {
  GENERIC = 'Genérico (UNE)',
  AISCAN = 'Aiscan',
  REVI = 'Revi',
  SOLERA = 'Solera',
  PEMSA = 'Pemsa',
  INTERFLEX = 'Interflex',
  GAESTOPAS = 'Gaestopas',
  COURANT = 'Courant',
  GEWISS = 'Gewiss',
  HELLERMANNTYTON = 'HellermannTyton',
  SIMON = 'Simon',
  UNEX = 'Unex',
  EVIA = 'Evia',
  CANALPLAST = 'Canalplast',
  LEGRAND = 'Legrand',
  SCHNEIDER = 'Schneider Electric',
  FAMATEL = 'Famatel',
  BASOR = 'Basor',
  OBO = 'OBO Bettermann',
  ADEE = 'Adee',
  DIETZEL = 'Dietzel Univolt'
}

export enum CableManufacturer {
  GENERIC = 'Genérico (UNE)',
  PRYSMIAN = 'Prysmian Group',
  DRAKA = 'Draka',
  TOPCABLE = 'Top Cable',
  MIGUELEZ = 'Miguélez',
  GENERAL_CABLE = 'General Cable',
  CABLES_RCT = 'Cables RCT',
  ASCABLE_RECAEL = 'Ascable-Recael',
  SUMCAB = 'Sumcab',
  NEXANS = 'Nexans',
  CAVIBEL = 'Cavibel',
  CABLES_COM = 'Cables de Comunicaciones'
}

export enum InstallationType {
  SUPERFICIE = 'Fija en Superficie',
  EMPOTRADA = 'Empotrada',
  AEREA = 'Aérea / Suspendida'
}

export enum TubeBranch {
  CORRUGADO = 'Corrugado',
  RIGIDO = 'Rígido',
}

export enum InsulationType {
  PVC = 'PVC (H07V-K)',
  LSZH = 'LSZH (H07Z1-K)',
  XLPE = 'XLPE (Mangueras)',
  EPR = 'EPR (Mangueras)'
}

export enum CableFormat {
  UNIPOLAR = 'Unipolar',
  MANGUERA = 'Manguera'
}

export interface CableData {
  id: string;
  gauge: number; 
  count: number; 
  innerCount: number; 
  manualDiameter?: number; 
  insulation: InsulationType;
  format: CableFormat;
  manufacturer: CableManufacturer;
}
