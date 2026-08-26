import logoUrl from '../assets/logFya.png';
import './Logo.css';

interface LogoProps {
  height?: number;
}

export function Logo({ height = 28 }: LogoProps) {
  return <img className="fya-logo" src={logoUrl} alt="Fya Social Capital" height={height} />;
}
