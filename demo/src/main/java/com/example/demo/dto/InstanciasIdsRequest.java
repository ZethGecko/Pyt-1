package com.example.demo.dto;

import java.util.List;

public class InstanciasIdsRequest {
    private List<Long> instanciasIds;

    public InstanciasIdsRequest() {}

    public List<Long> getInstanciasIds() { return instanciasIds; }
    public void setInstanciasIds(List<Long> instanciasIds) { this.instanciasIds = instanciasIds; }
}
