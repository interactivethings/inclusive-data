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
  select(P..Name,  P..Radius..EU., S..Hab.Zone.Min..AU., S..Hab.Zone.Max..AU.,P..Mean.Distance..AU., S..Teff..K., P..Mass.Class, P..Habitable, P..Confirmed) %>% 
  rename(P_name=P..Name, P_radius=P..Radius..EU., P_inner =S..Hab.Zone.Min..AU., P_outer=S..Hab.Zone.Max..AU., P_distance=P..Mean.Distance..AU., S_Teff=S..Teff..K., P_massClass=P..Mass.Class, P_habitable=P..Habitable, P_confirmed=P..Confirmed)

# Export as JSON
phl_json <- toJSON(phl_d, pretty=T, na="null")
write(phl_json, "tidy/phl.json")
