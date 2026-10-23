package com.br.cafeteriamaisamor.model;

import jakarta.persistence.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Entity
public class Usuarios {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
    public  long id;

   private Integer registro;
   @Column(length = 80)
   private String nome;
   @Column(length = 40)
   private String emaill;
   @Column(length = 10)
   private String senha;
   @DateTimeFormat(style = "yyyy-mm-dd")
   private LocalDate dataAdmissao;
   private Boolean ativo;

    //Construtorz
}


