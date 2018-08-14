library(jsonlite)
library(tidyverse)
raw <- read.csv("raw/planets.csv", skip=358)
d <- raw %>% select(pl_name, pl_disc, pl_discmethod, pl_rade, pl_masse, st_dist, pl_orbper, st_jmk2, st_hmk2, st_optmag, pl_orbsmax, pl_kepflag, pl_k2flag, st_teff)

# Export as JSON
json <- toJSON(d, pretty=T, na="null")
write(json, "tidy/planets.json")
