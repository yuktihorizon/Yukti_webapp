import React from 'react';
import '../styles/about.css'
import Header from "../assets/Experiencestore.png"
import weAreYuktiHero from "../assets/we-are-yukti-hero.png";
import image2 from "../assets/image2.png";

const About = () => {
  return (
    <main>
      {/* Hero Section */}
      <div
        className="hero-section"
        style={{
          backgroundImage: `url(${Header})`,
        }}
      >
        <div className="hero-content">
          <h1 className="hero-content1">
            Stillness is what creates love.
            <br/> Movement is what creates life. <br/> To be still and still moving—that is everything. – Do Hyun Choe<br/>
          </h1>
          <h1 className='hero-content2'>It is not down on any map;<br/> true places never are <br/>– Herman Melville</h1>
        </div>
      </div>

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-title">
            <h2>ABOUT</h2>
          </div>
          <div className="about-content">
            <p>
              In a world of mass-produced products, we at Yukti aim to create statement pieces that serve a purpose or
              solve a problem—while being both beautiful and aesthetically pleasing. Simply put we strive to create
              items that reflect our philosophy of crafting what we believe is right.
            </p>
            {/* <button className="more-button">
              More <span className="dot">→</span>
            </button> */}
          </div>
        </div>
        <div className="divider"></div>
      </section>

      {/* We Are Yukti Section */}
      <section className="we-are-section">
        <div className="we-are-container">
          <div className="we-are-image">
            <img
              src={weAreYuktiHero}
              alt="Yukti brand logo"
              width={800}
              height={800}
              className="furniture-image we-are-yukti-hero"
            />
          </div>
          <div className="we-are-content">
            <h2>
              WE ARE
              <br />
              <span className="brand-name">YUKTI</span>
            </h2>
            <div className="we-are-text">
              <p>
                Yukti was devised out of a dire need of bringing fine work time devotees to life. There was an enormous
                dearth of keeping different pieces of paper as they had a good design value, many were lost to passing
                time. But finally an answer was found in the form of Yukti.
              </p>
              <p>
                It was not only about bringing these doodles to life, but also refining the design with each prototype
                functionally, aesthetically or as a process.
              </p>
              <p>
                We believe as Yukti that it formed out of a few trials, shifted every product is first developed in 2d,
                on paper. Its about chasing the design to its original sketch and then a prototype is created to see if
                it ever steps in between. Yukti means "skill" in Sanskrit and that is what we are after in the product
                design category. And since skill is ever growing we are determined to create better designs.
              </p>
            </div>
          </div>
        </div>
        <div className="divider"></div>
      </section>

      {/* Why Choose Yukti Section */}
      <section className="why-choose-section">
        <div className="why-choose-container">
          <div className="why-choose-content">
            <h2>
              WHY CHOOSE
              <br />
              <span className="brand-name">YUKTI?</span>
            </h2>
            <div className="why-choose-text">
              <p>
                We have begun our journey of creating our place in the world of product design and we focused on
                creating unique and purpose driven designs that offer exceptional quality. We may be new to the scene
                but this is what keeps us motivated and fuels our growth and brings us to where we are today.
              </p>
              <p>
                Yukti we intended to grow and bring you an even heartier design, adventurous and creative at heart, we
                are constantly exploring and bringing something of true value. We keep creating prototypes in our
                process until it fulfills the purpose. We are constantly working on bringing new designs to life to the
                world to see.
              </p>
              <p>
                Not just the standard products, we also offer flexible, customizable solutions from our existing product
                lineup to meet your specific application needs. Additionally, we provide exceptional service and are
                happy to create one-off products tailored to your requirements.
              </p>
            </div>
          </div>
          <div className="why-choose-image">
            <img
              src={image2}
              alt="Yukti wooden cabinet"
              width={600}
              height={600}
              className="furniture-image"
            />
          </div>
        </div>
        <div className="divider"></div>
      </section>
    </main>
  )
  };
  
  export default About;
  