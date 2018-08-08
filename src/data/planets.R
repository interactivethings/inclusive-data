library(jsonlite)
library(tidyverse)
raw <- read.csv("raw/planets.csv", skip=358)
d <- raw %>% select(pl_name, pl_disc, pl_discmethod, pl_rade, pl_masse, st_dist)


# Data for streamgraph



# Export as JSON
json <- toJSON(d, pretty=T, na="null")
write(json, "tidy/planets.json")
