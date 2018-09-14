library(jsonlite)
library(tidyverse)
raw <- read.csv("raw/planets.csv", skip=358)
d <- raw %>% select(pl_name, pl_disc, pl_discmethod, pl_rade, pl_masse, st_dist, pl_orbper, st_jmk2, st_hmk2, st_optmag, pl_orbsmax, pl_kepflag, pl_k2flag, st_teff)

# Export as JSON
json <- toJSON(d, pretty=T, na="null")
write(json, "tidy/planets.json")



# Data from PHL
phl <- read.csv("raw/phl_hec_all_confirmed.csv")
phl_d <- phl %>%
  select(P..Name,
         P..Radius..EU.,
         P..Mass..EU.,
         P..Density..EU.,
         P..Gravity..EU.,
         P..Mean.Distance..AU.,
         P..Esc.Vel..EU.,
         P..SFlux.Mean..EU.,
         P..Teq.Mean..K.,
         P..Ts.Mean..K.,
         P..Mag,
         P..Appar.Size..deg.,
         P..Surf.Press..EU.,
         P..Period..days.,
         P..Sem.Major.Axis..AU.,
         P..Inclination..deg.,
         P..Mean.Distance..AU.,
         S..Hab.Zone.Min..AU.,
         S..Hab.Zone.Max..AU.,
         S..Mass..SU.,
         S..Radius..SU.,
         S..Luminosity..SU.,
         S..Distance..pc.,
         S..Teff..K.,
         S..Age..Gyrs.,
         P..Mass.Class,
         P..Habitable,
         P..Confirmed) %>%
  rename(pl_name=P..Name,
         pl_radius=P..Radius..EU.,
         pl_mass=P..Mass..EU.,
         pl_density=P..Density..EU.,
         pl_gravity=P..Gravity..EU.,
         pl_escapeVelocity=P..Esc.Vel..EU.,
         pl_starFluxMean=P..SFlux.Mean..EU.,
         pl_TeqMean=P..Teq.Mean..K.,
         pl_TsMean=P..Ts.Mean..K.,
         pl_magnitude=P..Mag,
         pl_apparentSize=P..Appar.Size..deg.,
         pl_surfacePressure=P..Surf.Press..EU.,
         pl_period=P..Period..days.,
         pl_semiMajorAxis=P..Sem.Major.Axis..AU.,
         pl_inclination=P..Inclination..deg.,
         pl_distance=P..Mean.Distance..AU.,
         pl_massClass=P..Mass.Class,
         pl_habitable=P..Habitable,
         pl_confirmed=P..Confirmed,
         st_inner =S..Hab.Zone.Min..AU.,
         st_outer=S..Hab.Zone.Max..AU.,
         st_Teff=S..Teff..K.,
         st_mass=S..Mass..SU.,
         st_radius=S..Radius..SU.,
         st_luminosity=S..Luminosity..SU.,
         st_distanceToSun=S..Distance..pc.,
         st_age=S..Age..Gyrs.)

# Export as JSON
phl_json <- toJSON(phl_d, pretty=T, na="null")
write(phl_json, "tidy/phl.json")
