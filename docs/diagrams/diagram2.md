```mermaid
flowchart TD
  Start([User Accesses Platform])
  Login[Login/Register]
  ChooseMenu[Choose Menu]
  SpecialDiet{Special Diet?}
  ShowOptions[Show Adapted Menus]
  OrderDetails[Fill Order Details]
  ConfirmOrder[Confirm Order]
  Payment[Make Payment]
  EndDone([Order Complete])

  Start --> Login --> ChooseMenu --> SpecialDiet
  SpecialDiet -- Yes --> ShowOptions --> OrderDetails
  SpecialDiet -- No --> OrderDetails
  OrderDetails --> ConfirmOrder --> Payment --> EndDone
```