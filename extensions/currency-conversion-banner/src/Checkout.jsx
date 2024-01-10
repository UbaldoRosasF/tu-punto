import React, { useState, useEffect } from "react";
import {
  reactExtension,
  Banner,
  useSettings,
  useNote,
  useApplyNoteChange,
  useApi,
  useSubscription,
} from "@shopify/ui-extensions-react/checkout";

// Set the entry points for the extension
const checkoutBlock = reactExtension("purchase.checkout.block.render", () => <App />);
export { checkoutBlock };

function App() {
  // Use the merchant-defined settings to retrieve the extension's content
  const {title: merchantTitle, description, collapsible, status: merchantStatus} = useSettings();
  // Obtener los distintos precios del Checkout
  const {cost} = useApi();
  // Suscribirse (escuchar) a futuros cambios en el costo total
  const totalAmount = useSubscription(cost.totalAmount);
  // ves = Bolívares
  const [ves, setVes] = useState(null);
  const applyNoteChange = useApplyNoteChange();
  const note = useNote();

  useEffect(() => {
    // Obtener bolívares y hacer su conversión a USD
    const fetchVes = async () => {
      const response = await fetch(`https://api.coinbase.com/v2/exchange-rates`);
      const allRates = await response.json();
      
      const VES = Number(allRates.data.rates.VES);
      const conversion = (VES * totalAmount.amount);        
      const moneyConversion = `$${conversion.toFixed(2)}`;
      const money = moneyConversion.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

      setVes(money);

      applyNoteChange({
        type: "updateNote",
        note: `Bolívares: ${moneyConversion}`,
      });

      console.log('nueva nota: ', money);
    };

    fetchVes();
  });

  // Set a default status for the banner if a merchant didn't configure the banner in the checkout editor
  const status = merchantStatus ?? 'info';
  const title = merchantTitle ?? 'Custom Banner';
  // Reemplazar [[amount]] con la conversión de VES a USD
  const fullDescription = `${description === undefined ? '' + ves : description.replace('[[amount]]', ves)}`;

  // Render the banner
  if (ves) {
    return (
     <Banner title={title} status={status} collapsible={collapsible}>
        {fullDescription}
      </Banner>
    );
  } else {
    return null;
  }
}
