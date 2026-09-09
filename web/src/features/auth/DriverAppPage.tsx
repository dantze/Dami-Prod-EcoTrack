/**
 * Where a DRIVER-only employee lands when they open the web app (TODO-100).
 *
 * The mirror of `mobile/app/office.tsx`, and it exists for the same reason that
 * one does. The driver experience is the phone (TODO-33); there is no driver
 * screen in this app at all. So a driver reaching `/` is not a permissions
 * problem to be fixed by an admin — their account already holds exactly the role
 * it should — and `ForbiddenPage`'s "cere-i unui administrator să ți-l acorde"
 * sends them to someone who can only confirm the role is already there.
 *
 * Two things are deliberately absent. There is no "back into the app" button:
 * `StatusScreen`'s default action resolves to `useHomePath`, which for this
 * account is `/`, which renders this screen again — the loop those screens
 * exist to break. And there is no deep link to the store or to a scheme: the
 * web app is not told the mobile app's address anywhere, and TODO-84 settled
 * that a signpost address is configured rather than derived. Naming the app is
 * enough for the one person who sees this.
 *
 * Deconectare is offered for the same reason mobile offers it: a shared browser
 * has to be releasable, and this is the only control on the screen.
 */

import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/auth';
import { StatusScreen } from './StatusScreen';

export function DriverAppPage() {
  const { user, logout } = useAuth();
  const firstName = user?.fullName?.split(' ')[0];

  return (
    <StatusScreen
      icon={<Smartphone aria-hidden />}
      title={firstName ? `Bună, ${firstName}!` : 'Aplicația pentru șoferi'}
      body="Rutele și sarcinile tale sunt în aplicația de mobil. Aplicația web este pentru colegii din birou — contul tău este configurat corect, nu ai nevoie de un rol în plus."
      actions={
        <Button variant="secondary" onClick={() => void logout()}>
          Deconectare
        </Button>
      }
    />
  );
}
