
import React from 'react';
import { Location } from 'react-router-dom';

interface PageTitleProps {
  location: Location;
}

const PageTitle: React.FC<PageTitleProps> = ({ location }) => {
  const getTitleFromPath = (pathname: string): string => {
    switch (pathname) {
      case '/dashboard':
        return 'Tableau de bord';
      case '/inspections':
        return 'Gestion des inspections';
      case '/users':
        return 'Gestion des utilisateurs';
      case '/franchises':
        return 'Gestion des franchises';
      case '/clients':
        return 'Gestion des clients';
      case '/rapports':
        return 'Rapports';
      case '/facturation':
        return 'Facturation';
      case '/nouvelle-inspection':
        return 'Nouvelle inspection';
      case '/parametres':
        return 'Paramètres';
      default:
        return '';
    }
  };

  return (
    <h1 className="text-xl font-semibold text-eagle-dark hidden sm:block">
      {getTitleFromPath(location.pathname)}
    </h1>
  );
};

export default PageTitle;
