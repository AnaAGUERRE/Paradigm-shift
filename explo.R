
library(tidyverse)
library(readxl)
library(jsonlite)
library(janitor)
library(scales)
library(patchwork)

df <- read_excel("clean_file.xlsx") %>%
  clean_names()

df_clean <- df %>%
  # Identifier les participants à exclure
  group_by(participant_code) %>%
  filter(
    !any(
      Round == 24 &
        (is.na(Flower_colors) | Flower_colors == "")
    )
  ) %>%
  ungroup()