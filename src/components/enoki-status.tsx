import { enokiConfig } from '../lib/enoki';
import { Badge } from './ui/badge';

export function EnokiStatus() {
  if (!enokiConfig.isConfigured) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">Enoki Disabled</Badge>
        <span>Regular transactions only (gas required)</span>
      </div>
    );
  }

  if (!enokiConfig.hasOAuth) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          Enoki Partial
        </Badge>
        <span>Sponsored transactions + regular wallets (gas-free)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600">
      <Badge variant="default" className="bg-green-100 text-green-800">
        Enoki Full
      </Badge>
      <span>Sponsored transactions + social wallets (gas-free)</span>
    </div>
  );
}
