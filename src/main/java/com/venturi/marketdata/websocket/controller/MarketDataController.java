package com.venturi.marketdata.websocket.controller;

import com.venturi.marketdata.websocket.model.Candle;
import com.venturi.marketdata.websocket.model.MarketData;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;


@Controller
public class MarketDataController {

    @CrossOrigin
    @MessageMapping("/candle")
    @SendTo("/topic/marketdata")
    public MarketData marketdata(Candle candle) throws Exception {
        return new MarketData(candle);
    }

}
