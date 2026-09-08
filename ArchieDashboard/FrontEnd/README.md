# DataMetrics

### Mappen structuur:

- `src/assets`
    I have put some .scss files here, the main scss file for everything and variables

- `src/components`
    - `/ChartJS`
        Here are the components for ChartJS - Line, Bar and Pie charts
    - `/Graph`
        Here I have the handler for the Graph (decided which ChartJS component to use)
    - `/Grid`
        This is the Grid component, it shows a grid of all the companys in the database
    - `/Layout`
        Here are all the components for the Layout, headers and a menu for profile
    - `/Login`
        This is the folder for login form component
    - `/settings`
        Component for settings -> Bijv theme picker
    - Some components are not in a folder, like GrowthPicker and loadingCircle
- `/config`
    This is the folder where to put config files, I have used this folder to put the API url
- `/interfaces`
    Here I have placed some interfaces I have implemented / was busy implementing
- `/layouts`
    This is the folder for the default layout and evt another one
- `/locales`
    This is the folders where all my languages are, you can always add one here, but you will need to add it to the i18n config.
- `/pages`
    Pages folder, here are all the different pages I use in the application
- `/router`
    Router folder, for the vue-router. Here I initialize all my routes and add Auth0 beforeEnter guard
- `/services`
    Here I have put the services I use, like a fetch / api service and I was busy with a SettingsService
- `/stores`
    Here I put all my stores in, like a update Store and filter Store (so filters get saved to be able to apply)
- `/types`
    Here I have put some types in, it is not all strongly typed, but there are atleast some types
- `/utils`
    - `/Calculating`
        Here are all the function that calculate different things, like percentage, differenceBetweenDates. It should be pretty self-explained by the names.
    - `/Handlers`
        Here I have put the GraphHandler, this is a handler which makes all the configurations for the line, bar and pie charts. It also puts the correct data in each one.
    - `/Transforming`
        Here I have put all the functions that are used to transform different things, like `/Calculating` it should be pretty easy to understand what which one does