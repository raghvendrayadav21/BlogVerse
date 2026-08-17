package com.blogverse.interaction.dto.request;

import com.blogverse.interaction.entity.Report;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReportRequest {

    @NotNull(message = "Report reason is required")
    private Report.Reason reason;

    private String description;
}
