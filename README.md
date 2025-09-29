# Introduction

This is a transfer of [shiny rrisk](https://github.com/BfRstats/shiny-rrisk) from `shiny`and `R`to pure `javascript`, `html`, and `css`.

## Simple model

A simple dose-response model to compute the risk of getting ill after ingesting a fixed dose `D`.

| node name     | node expr             |
| ------------- | --------------------- |
| `risk`        | `1 - exp(-r * D)`     |
| `r`           | `unif(0.0001, 0.001)` |
| `D`           | `norm(1000, 100)`     |

